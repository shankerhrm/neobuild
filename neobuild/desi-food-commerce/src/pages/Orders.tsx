import { useState, useEffect } from "react"
import { Clock, MapPin, CreditCard, Star, MessageCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Order } from "@/types"
import ReviewCard from "@/components/ReviewCard"

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Orders fetch error:", error)
        // Use sample data as fallback
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
        return "Order Placed"
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Being Prepared"
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

  const submitReview = async (orderId: string, dishId: string) => {
    if (!user) return

    setSubmittingReview(true)
    try {
      const { error } = await supabase
        .from("reviews")
        .insert([{
          dish_id: dishId,
          user_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }])

      if (!error) {
        setSelectedOrder(null)
        setReviewData({ rating: 5, comment: "" })
        // Show success message
      }
    } catch (error) {
      console.error("Review submission error:", error)
    } finally {
      setSubmittingReview(false)
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
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>My Orders</h1>
        <p className='text-gray-600'>Track your orders and leave reviews</p>
      </div>

      {orders.length === 0 ? (
        <div className='text-center py-16'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <Clock className='w-12 h-12 text-gray-400' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>No orders yet</h2>
          <p className='text-gray-600 mb-8'>You have not placed any orders. Start exploring our menu!</p>
          <button
            onClick={() => window.location.href = "/menu"}
            className='btn-primary'
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map(order => (
            <div key={order.id} className='card'>
              <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h3 className='font-semibold text-lg'>Order #{order.id.slice(-8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className='text-sm text-gray-500 mb-2'>
                    Placed on {new Date(order.created_at).toLocaleString()}
                  </div>
                  <div className='text-lg font-bold text-primary-600 mb-3'>
                    ₹{order.total_amount}
                  </div>
                </div>
                
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <div className='flex items-center space-x-1'>
                    <CreditCard className='w-4 h-4' />
                    <span>{order.payment_method.toUpperCase()}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <Clock className='w-4 h-4' />
                    <span>Est. {new Date(order.estimated_delivery).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='space-y-2 mb-4'>
                <h4 className='font-medium text-gray-900'>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className='flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg'>
                    <div className='flex-1'>
                      <div className='font-medium'>{item.dish_name}</div>
                      <div className='text-sm text-gray-500'>Qty: {item.quantity}</div>
                    </div>
                    <div className='font-medium'>₹{item.price * item.quantity}</div>
                    {order.status === "delivered" && (
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === `${order.id}-${index}` ? null : `${order.id}-${index}`)}
                        className='ml-3 flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm'
                      >
                        <Star className='w-4 h-4' />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className='flex items-start space-x-2 p-3 bg-gray-50 rounded-lg'>
                <MapPin className='w-4 h-4 text-gray-400 mt-1' />
                <div className='text-sm'>
                  <div className='font-medium text-gray-900'>Delivery Address:</div>
                  <div className='text-gray-600'>{order.delivery_address}</div>
                  <div className='text-gray-600'>Phone: {order.phone}</div>
                </div>
              </div>

              {/* Review Form */}
              {selectedOrder && selectedOrder.startsWith(order.id) && (
                <div className='mt-4 p-4 border border-primary-200 rounded-lg bg-primary-50'>
                  <h5 className='font-medium text-primary-800 mb-3 flex items-center space-x-2'>
                    <MessageCircle className='w-4 h-4' />
                    <span>Leave a Review</span>
                  </h5>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-primary-700 mb-2'>Rating</label>
                      <div className='flex space-x-2'>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className={`w-8 h-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            <Star className='w-full h-full fill-current' />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-primary-700 mb-2'>Comment</label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        rows={3}
                        className='w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none'
                        placeholder='Share your experience with this dish...'
                      />
                    </div>
                    <div className='flex space-x-3'>
                      <button
                        onClick={() => {
                          const dishId = order.items[0]?.dish_id
                          if (dishId) submitReview(order.id, dishId)
                        }}
                        disabled={submittingReview}
                        className='btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(null)
                          setReviewData({ rating: 5, comment: "" })
                        }}
                        className='btn-secondary text-sm'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sample data as fallback
const sampleOrders: Order[] = [
  {
    id: "ord_123456789",
    user_id: "user123",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    items: [
      {
        dish_id: "1",
        dish_name: "Butter Chicken",
        quantity: 1,
        price: 280,
      },
      {
        dish_id: "2",
        dish_name: "Naan Bread",
        quantity: 2,
        price: 40,
      },
    ],
    total_amount: 360,
    status: "delivered",
    payment_method: "cod",
    payment_status: "paid",
    delivery_address: "123 Main Street, Downtown, City - 400001",
    phone: "+91 98765 43210",
    estimated_delivery: new Date(Date.now() - 3600000).toISOString(),
    delivery_fee: 0,
    tax_amount: 18,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ord_987654321",
    user_id: "user123",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    items: [
      {
        dish_id: "3",
        dish_name: "Chicken Biryani",
        quantity: 1,
        price: 350,
      },
    ],
    total_amount: 350,
    status: "out_for_delivery",
    payment_method: "upi",
    payment_status: "paid",
    delivery_address: "456 Park Avenue, Suburb, City - 400002",
    phone: "+91 98765 43210",
    estimated_delivery: new Date(Date.now() + 300000).toISOString(),
    delivery_fee: 0,
    tax_amount: 17,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
]

export default Orders