import { Link } from "react-router-dom"
import { Clock, MapPin, Star, Truck } from "lucide-react"

const Home = () => {
  return (
    <div className='space-y-16'>
      {/* Hero Section */}
      <section className='text-center py-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl'>
        <div className='max-w-4xl mx-auto px-4'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in'>
            Authentic Desi Homemade Foods
          </h1>
          <p className='text-xl text-gray-600 mb-8 animate-slide-up'>
            Fresh, healthy, and delicious homemade meals delivered to your doorstep in just 10 minutes!
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in'>
            <Link to='/menu' className='btn-primary text-lg px-8 py-3'>
              Order Now
            </Link>
            <Link to='/register' className='btn-secondary text-lg px-8 py-3'>
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Why Choose Desi Foods?</h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            We bring you the taste of home with authentic recipes, fresh ingredients, and lightning-fast delivery.
          </p>
        </div>
        
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Clock className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>10 Min Delivery</h3>
            <p className='text-gray-600'>Ultra-fast delivery within 2km radius</p>
          </div>

          <div className='text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Star className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Authentic Taste</h3>
            <p className='text-gray-600'>Traditional recipes from Indian kitchens</p>
          </div>

          <div className='text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Truck className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Fresh Ingredients</h3>
            <p className='text-gray-600'>Sourced daily from local markets</p>
          </div>

          <div className='text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MapPin className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='font-semibold text-lg mb-2'>Hyperlocal</h3>
            <p className='text-gray-600'>Made by home chefs in your area</p>
          </div>
        </div>
      </section>

      {/* Popular Dishes Preview */}
      <section>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Popular Dishes</h2>
          <p className='text-gray-600'>Some of our most loved homemade specialties</p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {[
            {
              name: "Butter Chicken",
              price: "₹250",
              image: "https://placehold.co/300x200",
              rating: 4.8,
              time: "15 min",
            },
            {
              name: "Dal Makhani",
              price: "₹180",
              image: "https://placehold.co/300x200",
              rating: 4.7,
              time: "12 min",
            },
            {
              name: "Biryani",
              price: "₹320",
              image: "https://placehold.co/300x200",
              rating: 4.9,
              time: "20 min",
            },
          ].map((dish, index) => (
            <div key={index} className='card hover:shadow-md transition-shadow animate-slide-up'>
              <img
                src={dish.image}
                alt={dish.name}
                className='w-full h-48 object-cover rounded-lg mb-4'
              />
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-semibold text-lg'>{dish.name}</h3>
                <span className='text-primary-600 font-bold text-lg'>{dish.price}</span>
              </div>
              <div className='flex items-center justify-between text-sm text-gray-500'>
                <div className='flex items-center space-x-1'>
                  <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                  <span>{dish.rating}</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <Clock className='w-4 h-4' />
                  <span>{dish.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center mt-8'>
          <Link to='/menu' className='btn-primary text-lg px-8 py-3'>
            View Full Menu
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className='text-center py-16 bg-primary-600 rounded-2xl text-white'>
        <h2 className='text-3xl font-bold mb-4'>Ready to taste authentic home cooking?</h2>
        <p className='text-xl mb-8 opacity-90'>Join thousands of satisfied customers who trust us for their daily meals.</p>
        <Link to='/register' className='bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors'>
          Get Started Today
        </Link>
      </section>
    </div>
  )
}

export default Home