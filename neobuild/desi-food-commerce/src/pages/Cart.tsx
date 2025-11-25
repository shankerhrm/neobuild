import { Link } from "react-router-dom"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/CartContext"

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, totalItems } = useCart()

  if (cart.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <ShoppingBag className='w-24 h-24 text-gray-300 mx-auto mb-6' />
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Your cart is empty</h2>
          <p className='text-gray-600 mb-8'>Looks like you have not added anything to your cart yet.</p>
          <Link to='/menu' className='btn-primary text-lg px-8 py-3'>
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Your Cart</h1>
        <p className='text-gray-600'>{totalItems} items ready for checkout</p>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2 space-y-4'>
          {cart.map(item => (
            <div key={item.id} className='card'>
              <div className='flex items-start space-x-4'>
                <img
                  src={item.image_url || "https://placehold.co/150x150"}
                  alt={item.name}
                  className='w-20 h-20 object-cover rounded-lg'
                />
                
                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h3 className='font-semibold text-lg text-gray-900'>{item.name}</h3>
                      <p className='text-sm text-gray-600 line-clamp-2'>{item.description}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className='text-red-500 hover:text-red-700 p-1'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'
                      >
                        <Minus className='w-4 h-4' />
                      </button>
                      <span className='font-medium text-lg min-w-[2rem] text-center'>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className='w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50'
                      >
                        <Plus className='w-4 h-4' />
                      </button>
                    </div>
                    
                    <div className='text-right'>
                      <div className='font-bold text-lg text-primary-600'>₹{item.price * item.quantity}</div>
                      <div className='text-sm text-gray-500'>₹{item.price} each</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className='space-y-6'>
          <div className='card sticky top-4'>
            <h3 className='font-semibold text-lg mb-4'>Order Summary</h3>
            
            <div className='space-y-3 mb-4'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Subtotal ({totalItems} items)</span>
                <span className='font-medium'>₹{totalAmount}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Delivery Fee</span>
                <span className='font-medium text-primary-600'>FREE</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Taxes</span>
                <span className='font-medium'>₹{Math.round(totalAmount * 0.05)}</span>
              </div>
              <hr className='border-gray-200' />
              <div className='flex justify-between text-lg font-bold'>
                <span>Total</span>
                <span className='text-primary-600'>₹{totalAmount + Math.round(totalAmount * 0.05)}</span>
              </div>
            </div>

            <div className='space-y-3'>
              <Link to='/checkout' className='w-full btn-primary py-3 text-center block'>
                Proceed to Checkout
              </Link>
              <Link to='/menu' className='w-full btn-secondary py-3 text-center block'>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Delivery Info */}
          <div className='card bg-primary-50 border-primary-200'>
            <h4 className='font-medium text-primary-800 mb-2'>🚚 Fast Delivery</h4>
            <p className='text-sm text-primary-700'>
              Your order will be delivered within 10 minutes if you are within 2km radius.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart