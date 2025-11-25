import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Truck, Clock, MapPin } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    notes: "",
    paymentMethod: "cod" as "cod" | "upi",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const deliveryFee = 0
  const taxAmount = Math.round(totalAmount * 0.05)
  const totalWithTax = totalAmount + taxAmount + deliveryFee

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Get the first item's provider (assuming all items are from same provider for now)
      const firstItem = cart[0]
      if (!firstItem) {
        setError("No items in cart")
        return
      }

      // In a real app, you would get provider_id from the dish data
      // For now, we'll use a sample provider ID
      const sampleProviderId = "123e4567-e89b-12d3-a456-426614174001"

      const orderData = {
        user_id: user.id,
        provider_id: sampleProviderId,
        items: cart.map(item => ({
          dish_id: item.id,
          dish_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalWithTax,
        status: "pending",
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === "cod" ? "pending" : "pending",
        delivery_address: formData.address,
        phone: formData.phone,
        notes: formData.notes,
        estimated_delivery: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
      }

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single()

      if (error) {
        console.error("Order error:", error)
        setError("Failed to place order. Please try again.")
        return
      }

      // Simulate payment processing for UPI
      if (formData.paymentMethod === "upi") {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update payment status
        await supabase
          .from("orders")
          .update({ payment_status: "paid" })
          .eq("id", data.id)
        
        // Create payment record
        await supabase
          .from("payments")
          .insert([{
            order_id: data.id,
            user_id: user.id,
            provider_id: sampleProviderId,
            amount: totalWithTax,
            payment_method: "upi",
            payment_status: "paid",
            transaction_id: `UPI${Date.now()}`,
            payment_gateway: "razorpay",
            paid_at: new Date().toISOString(),
          }])
      }

      clearCart()
      navigate("/orders", { 
        state: { 
          message: "Order placed successfully!", 
          orderId: data.id 
        } 
      })
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError(err.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>No items in cart</h2>
          <p className='text-gray-600 mb-8'>Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate("/menu")}
            className='btn-primary'
          >
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Checkout</h1>
        <p className='text-gray-600'>Complete your order details</p>
      </div>

      <form onSubmit={handleSubmit} className='grid lg:grid-cols-2 gap-8'>
        {/* Order Details */}
        <div className='space-y-6'>
          {/* Delivery Address */}
          <div className='card'>
            <div className='flex items-center space-x-2 mb-4'>
              <MapPin className='w-5 h-5 text-primary-600' />
              <h3 className='font-semibold text-lg'>Delivery Address</h3>
            </div>
            <textarea
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              required
              rows={3}
              className='input resize-none'
              placeholder='Enter your complete delivery address'
            />
          </div>

          {/* Contact Info */}
          <div className='card'>
            <h3 className='font-semibold text-lg mb-4'>Contact Information</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className='input'
                  placeholder='Enter your phone number'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Special Instructions (Optional)</label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className='input resize-none'
                  placeholder='Any special instructions for delivery...'
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className='card'>
            <div className='flex items-center space-x-2 mb-4'>
              <CreditCard className='w-5 h-5 text-primary-600' />
              <h3 className='font-semibold text-lg'>Payment Method</h3>
            </div>
            <div className='space-y-3'>
              <label className='flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50'>
                <input
                  type='radio'
                  name='paymentMethod'
                  value='cod'
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  className='text-primary-600'
                />
                <div className='flex-1'>
                  <div className='font-medium'>Cash on Delivery</div>
                  <div className='text-sm text-gray-500'>Pay when your order arrives</div>
                </div>
              </label>
              <label className='flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50'>
                <input
                  type='radio'
                  name='paymentMethod'
                  value='upi'
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleInputChange}
                  className='text-primary-600'
                />
                <div className='flex-1'>
                  <div className='font-medium'>UPI Payment</div>
                  <div className='text-sm text-gray-500'>Pay instantly via UPI</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className='space-y-6'>
          <div className='card sticky top-4'>
            <h3 className='font-semibold text-lg mb-4'>Order Summary</h3>
            
            {/* Items */}
            <div className='space-y-3 mb-4'>
              {cart.map(item => (
                <div key={item.id} className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='font-medium'>{item.name}</div>
                    <div className='text-sm text-gray-500'>Qty: {item.quantity}</div>
                  </div>
                  <div className='font-medium'>₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <hr className='border-gray-200 my-4' />

            {/* Totals */}
            <div className='space-y-2 mb-4'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-primary-600' : ''}>₹{deliveryFee}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Tax (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <hr className='border-gray-200' />
              <div className='flex justify-between text-lg font-bold'>
                <span>Total</span>
                <span className='text-primary-600'>₹{totalWithTax}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className='bg-primary-50 p-3 rounded-lg mb-4'>
              <div className='flex items-center space-x-2 text-primary-700 mb-1'>
                <Truck className='w-4 h-4' />
                <span className='font-medium text-sm'>Fast Delivery</span>
              </div>
              <div className='flex items-center space-x-2 text-primary-600'>
                <Clock className='w-4 h-4' />
                <span className='text-sm'>Estimated delivery: ~10 minutes</span>
              </div>
            </div>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? "Processing..." : `Place Order (₹${totalWithTax})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout