export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  created_at: string
}

export interface Provider {
  id: string
  user_id: string
  business_name: string
  business_address: string
  phone: string
  email: string
  cuisine_types: string[]
  delivery_radius: number
  is_verified: boolean
  is_active: boolean
  rating: number
  total_orders: number
  created_at: string
}

export interface Dish {
  id: string
  provider_id: string
  name: string
  description: string
  price: number
  original_price?: number
  image_url?: string
  category: string
  dietary_info: string
  is_available: boolean
  prep_time: number
  serves: number
  calories: number
  protein: number
  carbs: number
  fat: number
  rating?: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  provider_id: string
  items: OrderItem[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  payment_method: 'cod' | 'upi'
  payment_status: 'pending' | 'paid' | 'failed'
  delivery_address: string
  phone: string
  notes?: string
  estimated_delivery: string
  actual_delivery?: string
  delivery_fee: number
  tax_amount: number
  created_at: string
}

export interface OrderItem {
  dish_id: string
  dish_name: string
  quantity: number
  price: number
}

export interface Payment {
  id: string
  order_id: string
  user_id: string
  provider_id: string
  amount: number
  payment_method: 'cod' | 'upi'
  payment_status: 'pending' | 'paid' | 'failed'
  transaction_id?: string
  payment_gateway?: string
  paid_at?: string
  created_at: string
}

export interface Invoice {
  id: string
  order_id: string
  payment_id?: string
  user_id: string
  provider_id: string
  invoice_number: string
  total_amount: number
  tax_amount: number
  delivery_fee: number
  discount_amount: number
  final_amount: number
  invoice_date: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
}

export interface Review {
  id: string
  dish_id: string
  user_id: string
  customer_name?: string
  rating: number
  comment: string
  created_at: string
}