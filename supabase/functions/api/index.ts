// Supabase Edge Function - Pizza API
// Handles all API requests for the pizza ordering system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Response helper
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// Error response helper
function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status)
}

// Initialize Supabase client
function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  // Get auth header if present
  const authHeader = req.headers.get('Authorization') ?? ''
  
  // Use service role key for admin operations, anon key for public
  const key = authHeader ? supabaseAnonKey : supabaseServiceKey

  return createClient(supabaseUrl, key, {
    global: {
      headers: { Authorization: authHeader },
    },
  })
}

// Parse URL path segments
function parsePath(url: string): { segments: string[], query: URLSearchParams } {
  const parsedUrl = new URL(url)
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)
  // Remove 'api' from segments if present
  const apiIndex = pathSegments.indexOf('api')
  const segments = apiIndex >= 0 ? pathSegments.slice(apiIndex + 1) : pathSegments
  return { segments, query: parsedUrl.searchParams }
}

// ============================================
// HANDLERS
// ============================================

// Get all pizzas (menu)
async function handleGetPizzas(supabase: any, query: URLSearchParams) {
  const category = query.get('category')
  const available = query.get('available')
  
  let queryBuilder = supabase
    .from('pizzas')
    .select(`
      *,
      pizza_toppings (
        is_included,
        toppings (id, name, price, category)
      )
    `)
    .order('created_at', { ascending: true })

  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }
  
  if (available !== null) {
    queryBuilder = queryBuilder.eq('is_available', available === 'true')
  }

  const { data, error } = await queryBuilder

  if (error) {
    return errorResponse(error.message, 500)
  }

  // Transform data to flatten toppings
  const pizzas = data.map((pizza: any) => ({
    ...pizza,
    toppings: pizza.pizza_toppings?.map((pt: any) => ({
      ...pt.toppings,
      is_included: pt.is_included,
    })) || [],
    pizza_toppings: undefined,
  }))

  return jsonResponse({ pizzas })
}

// Get single pizza by ID
async function handleGetPizzaById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('pizzas')
    .select(`
      *,
      pizza_toppings (
        is_included,
        toppings (id, name, price, category)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return errorResponse('Pizza not found', 404)
    }
    return errorResponse(error.message, 500)
  }

  // Transform data
  const pizza = {
    ...data,
    toppings: data.pizza_toppings?.map((pt: any) => ({
      ...pt.toppings,
      is_included: pt.is_included,
    })) || [],
    pizza_toppings: undefined,
  }

  return jsonResponse({ pizza })
}

// Get all toppings
async function handleGetToppings(supabase: any, query: URLSearchParams) {
  const category = query.get('category')
  
  let queryBuilder = supabase
    .from('toppings')
    .select('*')
    .eq('is_available', true)
    .order('name', { ascending: true })

  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  const { data, error } = await queryBuilder

  if (error) {
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ toppings: data })
}

// Create new order
async function handleCreateOrder(supabase: any, body: any) {
  const { 
    customer_name, 
    customer_email, 
    customer_phone,
    delivery_address,
    delivery_instructions,
    order_type,
    items,
    notes 
  } = body

  // Validate required fields
  if (!customer_name || !customer_email || !items || items.length === 0) {
    return errorResponse('Missing required fields: customer_name, customer_email, and items are required')
  }

  // Calculate totals
  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const itemSubtotal = item.unit_price * item.quantity
    let toppingsTotal = 0

    // Calculate toppings total
    if (item.toppings && item.toppings.length > 0) {
      for (const topping of item.toppings) {
        toppingsTotal += topping.price || 0
      }
    }

    const itemTotal = (itemSubtotal + toppingsTotal) * item.quantity
    subtotal += itemTotal

    orderItems.push({
      ...item,
      subtotal: itemTotal,
    })
  }

  // Calculate tax (assuming 8.5% tax rate)
  const taxRate = 0.085
  const tax = subtotal * taxRate
  
  // Delivery fee
  const deliveryFee = order_type === 'delivery' ? 5.99 : 0
  
  // Total
  const total = subtotal + tax + deliveryFee

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_instructions,
      order_type: order_type || 'delivery',
      status: 'pending',
      subtotal,
      tax,
      delivery_fee: deliveryFee,
      total,
      notes,
    })
    .select()
    .single()

  if (orderError) {
    return errorResponse(orderError.message, 500)
  }

  // Create order items
  const orderItemsToInsert = orderItems.map((item: any) => ({
    order_id: order.id,
    pizza_id: item.pizza_id,
    pizza_name: item.pizza_name,
    quantity: item.quantity,
    size: item.size || 'medium',
    unit_price: item.unit_price,
    subtotal: item.subtotal,
    special_instructions: item.special_instructions,
  }))

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert)
    .select()

  if (itemsError) {
    // Try to rollback order
    await supabase.from('orders').delete().eq('id', order.id)
    return errorResponse(itemsError.message, 500)
  }

  // Insert order item toppings
  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i]
    const insertedItem = insertedItems[i]

    if (item.toppings && item.toppings.length > 0) {
      const toppingsToInsert = item.toppings.map((topping: any) => ({
        order_item_id: insertedItem.id,
        topping_id: topping.id,
        topping_name: topping.name,
        price: topping.price,
      }))

      const { error: toppingsError } = await supabase
        .from('order_item_toppings')
        .insert(toppingsToInsert)

      if (toppingsError) {
        console.error('Error inserting toppings:', toppingsError)
      }
    }
  }

  // Return created order with items
  const { data: completeOrder } = await supabase
    .from('orders_with_items')
    .select('*')
    .eq('id', order.id)
    .single()

  return jsonResponse({ 
    message: 'Order created successfully',
    order: completeOrder || order 
  }, 201)
}

// Get orders (with optional filtering)
async function handleGetOrders(supabase: any, query: URLSearchParams) {
  const email = query.get('email')
  const status = query.get('status')
  const limit = parseInt(query.get('limit') || '50')
  const offset = parseInt(query.get('offset') || '0')

  let queryBuilder = supabase
    .from('orders_with_items')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (email) {
    queryBuilder = queryBuilder.eq('customer_email', email)
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  const { data, error } = await queryBuilder

  if (error) {
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ orders: data })
}

// Get single order by ID
async function handleGetOrderById(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('orders_with_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return errorResponse('Order not found', 404)
    }
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ order: data })
}

// Update order status
async function handleUpdateOrderStatus(supabase: any, id: string, body: any) {
  const { status } = body

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled']
  
  if (!status || !validStatuses.includes(status)) {
    return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return errorResponse('Order not found', 404)
    }
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ 
    message: 'Order status updated',
    order: data 
  })
}

// Get categories
async function handleGetCategories(supabase: any) {
  const { data, error } = await supabase
    .from('pizzas')
    .select('category')
    .order('category')

  if (error) {
    return errorResponse(error.message, 500)
  }

  // Get unique categories
  const categories = [...new Set(data.map((p: any) => p.category))]

  return jsonResponse({ categories })
}

// ============================================
// MAIN REQUEST HANDLER
// ============================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = getSupabaseClient(req)
  const { segments, query } = parsePath(req.url)
  const method = req.method

  try {
    // Route: GET /pizzas
    if (segments[0] === 'pizzas' && segments.length === 1 && method === 'GET') {
      return await handleGetPizzas(supabase, query)
    }

    // Route: GET /pizzas/:id
    if (segments[0] === 'pizzas' && segments.length === 2 && method === 'GET') {
      return await handleGetPizzaById(supabase, segments[1])
    }

    // Route: GET /toppings
    if (segments[0] === 'toppings' && segments.length === 1 && method === 'GET') {
      return await handleGetToppings(supabase, query)
    }

    // Route: POST /orders
    if (segments[0] === 'orders' && segments.length === 1 && method === 'POST') {
      const body = await req.json()
      return await handleCreateOrder(supabase, body)
    }

    // Route: GET /orders
    if (segments[0] === 'orders' && segments.length === 1 && method === 'GET') {
      return await handleGetOrders(supabase, query)
    }

    // Route: GET /orders/:id
    if (segments[0] === 'orders' && segments.length === 2 && method === 'GET') {
      return await handleGetOrderById(supabase, segments[1])
    }

    // Route: PATCH /orders/:id/status
    if (segments[0] === 'orders' && segments.length === 2 && segments[1] !== '' && method === 'PATCH') {
      const body = await req.json()
      return await handleUpdateOrderStatus(supabase, segments[1], body)
    }

    // Route: GET /categories
    if (segments[0] === 'categories' && segments.length === 1 && method === 'GET') {
      return await handleGetCategories(supabase)
    }

    // Health check
    if (segments.length === 0 || (segments.length === 1 && segments[0] === '')) {
      return jsonResponse({ 
        status: 'ok', 
        message: 'Pizza API is running',
        endpoints: [
          'GET /pizzas - Get all pizzas (menu)',
          'GET /pizzas/:id - Get single pizza',
          'GET /toppings - Get all toppings',
          'GET /categories - Get pizza categories',
          'POST /orders - Create new order',
          'GET /orders - Get orders (filter by email or status)',
          'GET /orders/:id - Get single order',
          'PATCH /orders/:id/status - Update order status',
        ]
      })
    }

    // 404 for unknown routes
    return errorResponse('Endpoint not found', 404)

  } catch (error) {
    console.error('Error:', error)
    return errorResponse('Internal server error', 500)
  }
})