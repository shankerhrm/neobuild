import { Star, User } from "lucide-react"
import { Review } from "@/types"

interface ReviewCardProps {
  review: Review
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className='card animate-slide-up'>
      <div className='flex items-start space-x-3'>
        <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
          <User className='w-5 h-5 text-primary-600' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900'>{review.customer_name || "Anonymous"}</h4>
            <div className='flex items-center space-x-1'>
              {renderStars(review.rating)}
            </div>
          </div>
          <p className='text-gray-600 mb-2'>{review.comment}</p>
          <div className='text-sm text-gray-400'>
            {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewCard