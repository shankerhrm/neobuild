import { Star, Clock, Users } from "lucide-react"
import { Dish } from "@/types"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

interface DishCardProps {
  dish: Dish
}

const DishCard = ({ dish }: DishCardProps) => {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login")
      return
    }
    addToCart(dish)
  }

  const getDietaryBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "veg":
        return "bg-green-100 text-green-800"
      case "non-veg":
        return "bg-red-100 text-red-800"
      case "vegan":
        return "bg-primary-100 text-primary-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className='card hover:shadow-md transition-shadow duration-200 animate-fade-in'>
      <div className='relative mb-4'>
        <img
          src={dish.image_url || "https://placehold.co/300x200"}
          alt={dish.name}
          className='w-full h-48 object-cover rounded-lg'
        />
        <div className='absolute top-2 right-2'>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDietaryBadgeColor(dish.dietary_info)}`}>
            {dish.dietary_info}
          </span>
        </div>
        {!dish.is_available && (
          <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
            <span className='text-white font-medium'>Out of Stock</span>
          </div>
        )}
      </div>

      <div className='mb-3'>
        <h3 className='font-semibold text-lg text-gray-900 mb-1'>{dish.name}</h3>
        <p className='text-gray-600 text-sm line-clamp-2'>{dish.description}</p>
      </div>

      <div className='flex items-center space-x-4 mb-3 text-sm text-gray-500'>
        <div className='flex items-center space-x-1'>
          <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
          <span>{dish.rating || "4.5"}</span>
        </div>
        <div className='flex items-center space-x-1'>
          <Clock className='w-4 h-4' />
          <span>{dish.prep_time}min</span>
        </div>
        <div className='flex items-center space-x-1'>
          <Users className='w-4 h-4' />
          <span>Serves {dish.serves}</span>
        </div>
      </div>

      <div className='mb-4'>
        <div className='text-xs text-gray-500 mb-1'>Nutrition (per serving):</div>
        <div className='flex flex-wrap gap-2'>
          <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>
            {dish.calories}cal
          </span>
          <span className='bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded'>
            {dish.protein}g protein
          </span>
          <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
            {dish.carbs}g carbs
          </span>
          <span className='bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded'>
            {dish.fat}g fat
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {dish.original_price && dish.original_price > dish.price && (
            <span className='text-sm text-gray-400 line-through'>₹{dish.original_price}</span>
          )}
          <span className='text-xl font-bold text-primary-600'>₹{dish.price}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!dish.is_available}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            dish.is_available
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {dish.is_available ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  )
}

export default DishCard