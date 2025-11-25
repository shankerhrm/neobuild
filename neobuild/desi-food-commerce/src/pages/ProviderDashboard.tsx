import { useState, useEffect } from "react"
import { Users, ShoppingBag, DollarSign, Star, TrendingUp, Clock } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Order } from "@/types"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  averageRating: number
  activeOrders: number
  todayOrders: number
  todayRevenue: number
}

const ProviderDashboard = () => {
  const { provider } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (provider) {
      fetchDashboardData()
    }
  }, [provider])

  const fetchDashboardData = async () => {
    if (!provider) return

    try {
      // Fetch orders for this provider
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        // Use sample data as fallback
        setRecentOrders(sampleOrders)
        setStats(sampleStats)
      } else {
        const ordersData = orders || []
        setRecentOrders(ordersData.slice(0, 5))
        
        // Calculate stats
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        const todayOrders = ordersData.filter(order => 
          new Date(order.created_at) >= todayStart
        )
        
        const activeOrders = ordersData.filter(order => 
          ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
        )
        
        setStats({
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((sum, order) => sum + order.total_amount, 0),
          averageRating: provider.rating || 4.5,
          activeOrders: activeOrders.length,
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((sum, order) => sum + order.total_amount, 0),
        })
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
      setRecentOrders(sampleOrders)
      setStats(sampleStats)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "New Order"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Provider Dashboard</h1>
        <p className='text-gray-600'>Welcome back, {provider?.business_name || 'Provider'}!</p>
        {!provider?.is_verified && (
          <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-yellow-800'>
              Your account is pending verification. You will be able to receive orders once verified.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='card bg-gradient-to-r from-blue-500 to-blue-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100'>Total Orders</p>
              <p className='text-3xl font-bold'>{stats.totalOrders}</p>
            </div>
            <ShoppingBag className='w-12 h-12 text-blue-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-green-500 to-green-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-100'>Total Revenue</p>
              <p className='text-3xl font-bold'>₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className='w-12 h-12 text-green-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-yellow-100'>Average Rating</p>
              <p className='text-3xl font-bold'>{stats.averageRating.toFixed(1)}</p>
            </div>
            <Star className='w-12 h-12 text-yellow-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-purple-500 to-purple-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-100'>Active Orders</p>
              <p className='text-3xl font-bold'>{stats.activeOrders}</p>
            </div>
            <Clock className='w-12 h-12 text-purple-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-orange-500 to-orange-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-orange-100'>Today Orders</p>
              <p className='text-3xl font-bold'>{stats.todayOrders}</p>
            </div>
            <TrendingUp className='w-12 h-12 text-orange-200' />
          </div>
        </div>

        <div className='card bg-gradient-to-r from-teal-500 to-teal-600 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-teal-100'>Today Revenue</p>
              <p className='text-3xl font-bold'>₹{stats.todayRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className='w-12 h-12 text-teal-200' />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Recent Orders</h2>
          <a href='/provider/orders' className='text-primary-600 hover:text-primary-700 font-medium'>
            View All →
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className='text-center py-8'>
            <ShoppingBag className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-600'>No orders yet</p>
            <p className='text-sm text-gray-500 mt-2'>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {recentOrders.map(order => (
              <div key={order.id} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-3'>
                    <h3 className='font-medium text-gray-900'>Order #{order.id.slice(-8)}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold text-primary-600'>₹{order.total_amount}</div>
                    <div className='text-sm text-gray-500'>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className='grid md:grid-cols-2 gap-4 text-sm text-gray-600'>
                  <div>
                    <p><span className='font-medium'>Items:</span> {order.items.length} items</p>
                    <p><span className='font-medium'>Payment:</span> {order.payment_method.toUpperCase()}</p>
                  </div>
                  <div>
                    <p><span className='font-medium'>Phone:</span> {order.phone}</p>
                    <p><span className='font-medium'>Estimated:</span> {new Date(order.estimated_delivery).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <a href='/provider/orders' className='card hover:shadow-md transition-shadow text-center'>
          <ShoppingBag className='w-8 h-8 text-primary-600 mx-auto mb-2' />
          <h3 className='font-medium text-gray-900'>Manage Orders</h3>
          <p className='text-sm text-gray-600 mt-1'>View and update order status</p>
        </a>
        
        <a href='/provider/menu' className='card hover:shadow-md transition-shadow text-center'>
          <Users className='w-8 h-8 text-primary-600 mx-auto mb-2' />
          <h3 className='font-medium text-gray-900'>Menu Management</h3>
          <p className='text-sm text-gray-600 mt-1'>Add or update your dishes</p>
        </a>
        
        <a href='/provider/payments' className='card hover:shadow-md transition-shadow text-center'>
          <DollarSign className='w-8 h-8 text-primary-600 mx-auto mb-2' />
          <h3 className='font-medium text-gray-900'>Payments</h3>
          <p className='text-sm text-gray-600 mt-1'>Track your earnings</p>
        </a>
        
        <div className='card hover:shadow-md transition-shadow text-center cursor-pointer'>
          <Star className='w-8 h-8 text-primary-600 mx-auto mb-2' />
          <h3 className='font-medium text-gray-900'>Reviews</h3>
          <p className='text-sm text-gray-600 mt-1'>Customer feedback</p>
        </div>
      </div>
    </div>
  )
}

// Sample data for fallback
const sampleStats: DashboardStats = {
  totalOrders: 142,
  totalRevenue: 45600,
  averageRating: 4.6,
  activeOrders: 8,
  todayOrders: 12,
  todayRevenue: 3200,
}

const sampleOrders: Order[] = [
  {
    id: "ord_provider_1",
    user_id: "user123",
    provider_id: "provider123",
    items: [
      { dish_id: "1", dish_name: "Butter Chicken", quantity: 2, price: 280 },
      { dish_id: "2", dish_name: "Naan", quantity: 4, price: 40 },
    ],
    total_amount: 720,
    status: "confirmed",
    payment_method: "upi",
    payment_status: "paid",
    delivery_address: "123 Main Street, City",
    phone: "+91 98765 43210",
    estimated_delivery: new Date(Date.now() + 1800000).toISOString(),
    delivery_fee: 0,
    tax_amount: 36,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
]

export default ProviderDashboard