import { createContext, useContext, useState, useEffect } from "react"
import { Dish } from "@/types"

interface CartItem extends Dish {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (dish: Dish) => void
  removeFromCart: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("desi-food-cart")
    return savedCart ? JSON.parse(savedCart) : []
  })

  useEffect(() => {
    localStorage.setItem("desi-food-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (dish: Dish) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dish.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...dish, quantity: 1 }]
    })
  }

  const removeFromCart = (dishId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== dishId))
  }

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === dishId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}