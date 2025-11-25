import { useState, useEffect } from "react"
import { Clock, Phone, MapPin, CreditCard, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Order } from "@/types"

const ProviderOrders = () => {
  const { provider } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ]

  useEffect(() => {
    if (provider) {
      fetchOrders()
    }
  }, [provider])

  const fetchOrders = async () => {
    if (!provider) return

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        setOrders(sampleOrders)
      } else {
        setOrders(data || sampleOrders)
      }
    } catch (error) {
      console.error("Error:", error)
      setOrders(sampleOrders)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          ...(newStatus === 'delivered' && { actual_delivery: new Date().toISOString() })
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order:", error)
      } else {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: newStatus as any,
                ...(newStatus === 'delivered' && { actual_delivery: new Date().toISOString() })
              }
            : order
        ))
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className='w-4 h-4' />
      case "confirmed":
        return <CheckCircle className='w-4 h-4' />
      case "preparing":
        return <Package className='w-4 h-4' />
      case "out_for_delivery":
        return <Truck className='w-4 h-4' />
      case "delivered":
        return <CheckCircle className='w-4 h-4' />
      case "cancelled":
        return <XCircle className='w-4 h-4' />
      default:
        return <Clock className='w-4 h-4' />
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"]
      case "confirmed":
        return ["preparing", "cancelled"]
      case "preparing":
        return ["out_for_delivery", "cancelled"]
      case "out_for_delivery":
        return ["delivered", "cancelled"]
      default:
        return []
    }
  }

  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status
  }

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

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
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Order Management</h1>
          <p className='text-gray-600'>Manage incoming orders and track delivery status</p>
        </div>
        
        <div className='mt-4 sm:mt-0'>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='input max-w-xs'
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({selectedStatus === "all" ? orders.length : orders.filter(o => o.status === option.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className='card text-center py-16'>
          <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>No orders found</h2>
          <p className='text-gray-600'>
            {selectedStatus === "all" 
              ? "You haven't received any orders yet." 
              : `No ${getStatusLabel(selectedStatus).toLowerCase()} orders found.`}
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {filteredOrders.map(order => (
            <div key={order.id} className='card'>
              <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <h3 className='text-xl font-semibold text-gray-900'>Order #{order.id.slice(-8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} flex items-center space-x-1`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusLabel(order.status)}</span>
                    </span>
                  </div>
                  
                  <div className='grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Clock className='w-4 h-4' />
                        <span>Ordered: {new Date(order.created_at).toLocaleString()}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Phone className='w-4 h-4' />
                        <span>{order.phone}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <CreditCard className='w-4 h-4' />
                        <span>{order.payment_method.toUpperCase()} - {order.payment_status}</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Truck className='w-4 h-4' />
                        <span>Est. Delivery: {new Date(order.estimated_delivery).toLocaleTimeString()}</span>
                      </div>
                      {order.actual_delivery && (
                        <div className='flex items-center space-x-2 text-green-600'>
                          <CheckCircle className='w-4 h-4' />
                          <span>Delivered: {new Date(order.actual_delivery).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className='lg:ml-6 flex flex-col items-end'>
                  <div className='text-2xl font-bold text-primary-600 mb-2'>₹{order.total_amount}</div>
                  <div className='text-sm text-gray-500'>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='mb-6'>
                <h4 className='font-medium text-gray-900 mb-3'>Order Items:</h4>
                <div className='space-y-2'>
                  {order.items.map((item, index) => (
                    <div key={index} className='flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg'>
                      <div className='flex-1'>
                        <div className='font-medium text-gray-900'>{item.dish_name}</div>
                        <div className='text-sm text-gray-500'>Quantity: {item.quantity}</div>
                      </div>
                      <div className='font-medium text-gray-900'>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className='mb-6'>
                <div className='flex items-start space-x-2 p-3 bg-gray-50 rounded-lg'>
                  <MapPin className='w-4 h-4 text-gray-400 mt-1' />
                  <div>
                    <div className='font-medium text-gray-900'>Delivery Address:</div>
                    <div className='text-gray-600'>{order.delivery_address}</div>
                    {order.notes && (
                      <div className='mt-1'>
                        <span className='font-medium text-gray-900'>Notes:</span>
                        <span className='text-gray-600 ml-1'>{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {getNextStatus(order.status).length > 0 && (
                <div className='flex flex-wrap gap-3 pt-4 border-t border-gray-200'>
                  {getNextStatus(order.status).map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                      disabled={updatingOrder === order.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        nextStatus === "cancelled"
                          ? "bg-red-100 hover:bg-red-200 text-red-700"
                          : "bg-primary-100 hover:bg-primary-200 text-primary-700"
                      }`}
                    >
                      {updatingOrder === order.id ? "Updating..." : `Mark as ${getStatusLabel(nextStatus)}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sample data for fallback
const sampleOrders: Order[] = [
  {
    id: "ord_provider_sample_1",
    user_id: "user123",
    provider_id: "provider123",
    items: [
      { dish_id: "1", dish_name: "Butter Chicken", quantity: 2, price: 280 },
      { dish_id: "2", dish_name: "Garlic Naan", quantity: 4, price: 45 },
      { dish_id: "3", dish_name: "Basmati Rice", quantity: 1, price: 120 },
    ],
    total_amount: 800,
    status: "preparing",
    payment_method: "upi",
    payment_status: "paid",
    delivery_address: "Flat 204, Green Apartments, Sector 15, New Delhi - 110001",
    phone: "+91 98765 43210",
    notes: "Please ring the bell twice. Building entrance is from the side gate.",
    estimated_delivery: new Date(Date.now() + 1200000).toISOString(),
    delivery_fee: 0,
    tax_amount: 40,
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "ord_provider_sample_2",
    user_id: "user456",
    provider_id: "provider123",
    items: [
      { dish_id: "4", dish_name: "Paneer Tikka", quantity: 1, price: 240 },
      { dish_id: "5", dish_name: "Dal Makhani", quantity: 2, price: 180 },
    ],
    total_amount: 600,
    status: "pending",
    payment_method: "cod",
    payment_status: "pending",
    delivery_address: "House No. 45, Raj Nagar, Ghaziabad - 201001",
    phone: "+91 87654 32109",
    estimated_delivery: new Date(Date.now() + 2400000).toISOString(),
    delivery_fee: 0,
    tax_amount: 30,
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
]

export default ProviderOrders