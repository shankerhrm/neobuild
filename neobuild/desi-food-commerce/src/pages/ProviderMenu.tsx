import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Dish } from "@/types"

const ProviderMenu = () => {
  const { provider } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    category: "",
    dietary_info: "Veg",
    prep_time: 15,
    serves: 2,
    calories: 300,
    protein: 15,
    carbs: 30,
    fat: 10,
    image_url: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const categories = ["Main Course", "Appetizers", "Rice", "Bread", "Desserts", "Beverages"]
  const dietTypes = ["Veg", "Non-Veg", "Vegan"]

  useEffect(() => {
    if (provider) {
      fetchDishes()
    }
  }, [provider])

  const fetchDishes = async () => {
    if (!provider) return

    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching dishes:", error)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      category: "",
      dietary_info: "Veg",
      prep_time: 15,
      serves: 2,
      calories: 300,
      protein: 15,
      carbs: 30,
      fat: 10,
      image_url: "",
    })
    setEditingDish(null)
    setShowAddForm(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider) return

    setSubmitting(true)
    setError("")

    try {
      const dishData = {
        ...formData,
        provider_id: provider.id,
        is_available: true,
        image_url: formData.image_url || "https://placehold.co/300x200",
      }

      if (editingDish) {
        // Update existing dish
        const { error } = await supabase
          .from("dishes")
          .update(dishData)
          .eq("id", editingDish.id)

        if (error) {
          setError(error.message)
        } else {
          setDishes(prev => prev.map(dish => 
            dish.id === editingDish.id ? { ...dish, ...dishData } : dish
          ))
          resetForm()
        }
      } else {
        // Add new dish
        const { data, error } = await supabase
          .from("dishes")
          .insert([dishData])
          .select()
          .single()

        if (error) {
          setError(error.message)
        } else if (data) {
          setDishes(prev => [data, ...prev])
          resetForm()
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (dish: Dish) => {
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      original_price: dish.original_price || 0,
      category: dish.category,
      dietary_info: dish.dietary_info,
      prep_time: dish.prep_time,
      serves: dish.serves,
      calories: dish.calories,
      protein: dish.protein,
      carbs: dish.carbs,
      fat: dish.fat,
      image_url: dish.image_url || "",
    })
    setEditingDish(dish)
    setShowAddForm(true)
  }

  const toggleAvailability = async (dishId: string, currentAvailability: boolean) => {
    try {
      const { error } = await supabase
        .from("dishes")
        .update({ is_available: !currentAvailability })
        .eq("id", dishId)

      if (error) {
        console.error("Error updating availability:", error)
      } else {
        setDishes(prev => prev.map(dish => 
          dish.id === dishId ? { ...dish, is_available: !currentAvailability } : dish
        ))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const deleteDish = async (dishId: string) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("dishes")
        .delete()
        .eq("id", dishId)

      if (error) {
        console.error("Error deleting dish:", error)
      } else {
        setDishes(prev => prev.filter(dish => dish.id !== dishId))
      }
    } catch (error) {
      console.error("Error:", error)
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
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Menu Management</h1>
          <p className='text-gray-600'>Add, edit, and manage your food items</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className='btn-primary flex items-center space-x-2 mt-4 sm:mt-0'
        >
          <Plus className='w-5 h-5' />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className='card'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              {editingDish ? "Edit Dish" : "Add New Dish"}
            </h2>
            <button
              onClick={resetForm}
              className='text-gray-500 hover:text-gray-700'
            >
              ×
            </button>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Dish Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='input'
                  placeholder='Enter dish name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Description *</label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className='input resize-none'
                  placeholder='Describe your dish'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Price (₹) *</label>
                  <input
                    type='number'
                    name='price'
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min='1'
                    className='input'
                    placeholder='0'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Original Price (₹)</label>
                  <input
                    type='number'
                    name='original_price'
                    value={formData.original_price}
                    onChange={handleInputChange}
                    min='0'
                    className='input'
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Category *</label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className='input'
                  >
                    <option value=''>Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Dietary Info *</label>
                  <select
                    name='dietary_info'
                    value={formData.dietary_info}
                    onChange={handleInputChange}
                    required
                    className='input'
                  >
                    {dietTypes.map(diet => (
                      <option key={diet} value={diet}>{diet}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Prep Time (min)</label>
                  <input
                    type='number'
                    name='prep_time'
                    value={formData.prep_time}
                    onChange={handleInputChange}
                    min='1'
                    className='input'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Serves</label>
                  <input
                    type='number'
                    name='serves'
                    value={formData.serves}
                    onChange={handleInputChange}
                    min='1'
                    className='input'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Image URL</label>
                <input
                  type='url'
                  name='image_url'
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className='input'
                  placeholder='https://example.com/image.jpg'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Calories</label>
                  <input
                    type='number'
                    name='calories'
                    value={formData.calories}
                    onChange={handleInputChange}
                    min='1'
                    className='input'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Protein (g)</label>
                  <input
                    type='number'
                    name='protein'
                    value={formData.protein}
                    onChange={handleInputChange}
                    min='0'
                    step='0.1'
                    className='input'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Carbs (g)</label>
                  <input
                    type='number'
                    name='carbs'
                    value={formData.carbs}
                    onChange={handleInputChange}
                    min='0'
                    step='0.1'
                    className='input'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Fat (g)</label>
                  <input
                    type='number'
                    name='fat'
                    value={formData.fat}
                    onChange={handleInputChange}
                    min='0'
                    step='0.1'
                    className='input'
                  />
                </div>
              </div>
            </div>

            <div className='md:col-span-2 flex space-x-4 pt-4'>
              <button
                type='submit'
                disabled={submitting}
                className='btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {submitting ? "Saving..." : (editingDish ? "Update Dish" : "Add Dish")}
              </button>
              <button
                type='button'
                onClick={resetForm}
                className='btn-secondary'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dishes List */}
      {dishes.length === 0 ? (
        <div className='card text-center py-16'>
          <Plus className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>No dishes added yet</h2>
          <p className='text-gray-600 mb-6'>Start building your menu by adding your first dish.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className='btn-primary'
          >
            Add Your First Dish
          </button>
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {dishes.map(dish => (
            <div key={dish.id} className={`card transition-opacity ${!dish.is_available ? 'opacity-60' : ''}`}>
              <div className='relative mb-4'>
                <img
                  src={dish.image_url || "https://placehold.co/300x200"}
                  alt={dish.name}
                  className='w-full h-48 object-cover rounded-lg'
                />
                <div className='absolute top-2 right-2 flex space-x-1'>
                  <button
                    onClick={() => toggleAvailability(dish.id, dish.is_available)}
                    className={`p-1 rounded-full ${dish.is_available ? 'bg-green-500' : 'bg-gray-500'} text-white`}
                    title={dish.is_available ? 'Available' : 'Unavailable'}
                  >
                    {dish.is_available ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
                  </button>
                </div>
              </div>

              <div className='mb-4'>
                <h3 className='font-semibold text-lg text-gray-900 mb-1'>{dish.name}</h3>
                <p className='text-gray-600 text-sm line-clamp-2'>{dish.description}</p>
              </div>

              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                  {dish.original_price && dish.original_price > dish.price && (
                    <span className='text-sm text-gray-400 line-through'>₹{dish.original_price}</span>
                  )}
                  <span className='text-xl font-bold text-primary-600'>₹{dish.price}</span>
                </div>
                <div className='text-sm text-gray-500'>
                  {dish.category} • {dish.dietary_info}
                </div>
              </div>

              <div className='flex space-x-2'>
                <button
                  onClick={() => handleEdit(dish)}
                  className='flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <Edit className='w-4 h-4' />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => deleteDish(dish.id)}
                  className='flex items-center justify-center p-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sample data for fallback
const sampleDishes: Dish[] = [
  {
    id: "dish_sample_1",
    provider_id: "provider123",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
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
]

export default ProviderMenu