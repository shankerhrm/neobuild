import { useState, useEffect } from "react"
import { Search, Filter } from "lucide-react"
import DishCard from "@/components/DishCard"
import { Dish } from "@/types"
import { supabase } from "@/lib/supabase"

const Menu = () => {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDiet, setSelectedDiet] = useState("All")
  
  const categories = ["All", "Main Course", "Appetizers", "Rice", "Bread", "Desserts", "Beverages"]
  const dietTypes = ["All", "Veg", "Non-Veg", "Vegan"]

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) {
        console.error("Error fetching dishes:", error)
        // Use sample data as fallback
        setDishes(sampleDishes)
      } else {
        setDishes(data || sampleDishes)
      }
    } catch (error) {
      console.error("Error:", error)
      setDishes(sampleDishes)
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory
    const matchesDiet = selectedDiet === "All" || dish.dietary_info === selectedDiet
    
    return matchesSearch && matchesCategory && matchesDiet
  })

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
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Our Menu</h1>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Discover authentic homemade dishes prepared with love and the finest ingredients.
        </p>
      </div>

      {/* Search and Filters */}
      <div className='space-y-4'>
        {/* Search */}
        <div className='relative max-w-md mx-auto'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search dishes...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-4 justify-center items-center'>
          <div className='flex items-center space-x-2'>
            <Filter className='w-5 h-5 text-gray-400' />
            <span className='text-sm font-medium text-gray-700'>Filters:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
          >
            {dietTypes.map(diet => (
              <option key={diet} value={diet}>{diet}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length > 0 ? (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <div className='text-center py-16'>
          <p className='text-gray-600 text-lg'>No dishes found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("All")
              setSelectedDiet("All")
            }}
            className='mt-4 btn-primary'
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

// Sample data as fallback
const sampleDishes: Dish[] = [
  {
    id: "1",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces, served with aromatic spices and herbs.",
    price: 280,
    original_price: 320,
    image_url: "https://placehold.co/300x200",
    category: "Main Course",
    dietary_info: "Non-Veg",
    is_available: true,
    prep_time: 25,
    serves: 2,
    calories: 450,
    protein: 35,
    carbs: 15,
    fat: 25,
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Dal Makhani",
    description: "Rich and creamy black lentils slow-cooked with butter and cream, a true Punjabi delight.",
    price: 220,
    image_url: "https://placehold.co/300x200",
    category: "Main Course",
    dietary_info: "Veg",
    is_available: true,
    prep_time: 20,
    serves: 2,
    calories: 380,
    protein: 18,
    carbs: 45,
    fat: 15,
    rating: 4.7,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice layered with spiced chicken, cooked to perfection with authentic spices.",
    price: 350,
    image_url: "https://placehold.co/300x200",
    category: "Rice",
    dietary_info: "Non-Veg",
    is_available: true,
    prep_time: 35,
    serves: 1,
    calories: 650,
    protein: 40,
    carbs: 75,
    fat: 20,
    rating: 4.9,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Paneer Tikka",
    description: "Marinated cottage cheese cubes grilled to perfection with bell peppers and onions.",
    price: 240,
    image_url: "https://placehold.co/300x200",
    category: "Appetizers",
    dietary_info: "Veg",
    is_available: true,
    prep_time: 18,
    serves: 2,
    calories: 320,
    protein: 22,
    carbs: 12,
    fat: 18,
    rating: 4.6,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Masala Chai",
    description: "Traditional Indian tea brewed with aromatic spices, milk, and love.",
    price: 30,
    image_url: "https://placehold.co/300x200",
    category: "Beverages",
    dietary_info: "Veg",
    is_available: true,
    prep_time: 5,
    serves: 1,
    calories: 80,
    protein: 3,
    carbs: 12,
    fat: 2,
    rating: 4.5,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    provider_id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Gulab Jamun",
    description: "Soft, spongy milk dumplings soaked in aromatic sugar syrup, a perfect sweet ending.",
    price: 120,
    image_url: "https://placehold.co/300x200",
    category: "Desserts",
    dietary_info: "Veg",
    is_available: false,
    prep_time: 15,
    serves: 4,
    calories: 180,
    protein: 4,
    carbs: 35,
    fat: 8,
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
]

export default Menu