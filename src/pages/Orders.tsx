import { useQuery } from '@tanstack/react-query'
import { Package, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react'
import { getUserOrders } from '../lib/supabase'
import { useAuthStore } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import { Link } from 'react-router-dom'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-blue-100 text-blue-700',
    icon: ChefHat,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-purple-100 text-purple-700',
    icon: Package,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
}

interface OrderItem {
  id: string
  pizza_id: string
  quantity: number
  size: string
  price: number
  pizzas: {
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  created_at: string
  status: keyof typeof STATUS_CONFIG
  total_amount: number
  delivery_address: string
  phone: string
  notes: string
  order_items: OrderItem[]
}

export default function Orders() {
  const { user } = useAuthStore()

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', 'user', user?.id],
    queryFn: () => getUserOrders(user!.id),
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load orders. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-display font-bold">My Orders</h1>
          <p className="text-white/90 mt-2">Track your pizza orders</p>
        </div>
      </div>

      <div className="container-custom py-8">
        {orders && orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order: Order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = status.icon

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-medium">{status.label}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {order.order_items.map((item: OrderItem) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.pizzas.image_url}
                              alt={item.pizzas.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.pizzas.name}</h4>
                            <p className="text-sm text-gray-500">{item.size} × {item.quantity}</p>
                            <p className="font-medium text-primary-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium">{order.delivery_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{order.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-primary-600">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-700">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}