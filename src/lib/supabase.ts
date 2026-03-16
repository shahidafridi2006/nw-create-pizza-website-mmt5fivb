import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '__SUPABASE_URL__'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '__SUPABASE_ANON_KEY__'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const getPizzas = async () => {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getPizzaById = async (id: string) => {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const createOrder = async (order: {
  user_id: string
  total_amount: number
  delivery_address: string
  phone: string
  notes?: string
  items: Array<{
    pizza_id: string
    quantity: number
    size: string
    price: number
  }>
}) => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.user_id,
      total_amount: order.total_amount,
      delivery_address: order.delivery_address,
      phone: order.phone,
      notes: order.notes,
      status: 'pending'
    })
    .select()
    .single()
  
  if (orderError) throw orderError
  
  const orderItems = order.items.map(item => ({
    order_id: orderData.id,
    pizza_id: item.pizza_id,
    quantity: item.quantity,
    size: item.size,
    price: item.price
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) throw itemsError
  
  return orderData
}

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        pizzas (name, image_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (name, email),
      order_items (
        *,
        pizzas (name, image_url)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
  
  if (error) throw error
}

export const createPizza = async (pizza: {
  name: string
  description: string
  image_url: string
  base_price: number
  category: string
  ingredients: string[]
  is_available?: boolean
}) => {
  const { data, error } = await supabase
    .from('pizzas')
    .insert(pizza)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updatePizza = async (id: string, pizza: Partial<{
  name: string
  description: string
  image_url: string
  base_price: number
  category: string
  ingredients: string[]
  is_available: boolean
}>) => {
  const { data, error } = await supabase
    .from('pizzas')
    .update(pizza)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deletePizza = async (id: string) => {
  const { error } = await supabase
    .from('pizzas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const getAllPizzas = async () => {
  const { data, error } = await supabase
    .from('pizzas')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateUserProfile = async (userId: string, profile: {
  name?: string
  phone?: string
  address?: string
}) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    })
  
  if (error) throw error
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}