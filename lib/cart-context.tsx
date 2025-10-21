// Shopping Cart Context for Multi-Service Bookings
// Handles cart state, item management, and package discounts

'use client'
import { createContext, useContext, useReducer, useEffect } from 'react'

export interface CartItem {
  id: string
  serviceId: string
  title: string
  category: string
  provider: string
  city: string
  quantity: number
  unitPrice: number
  totalPrice: number
  eventDate: string
  eventTime?: string
  isHireService: boolean
  duration?: string
  image?: string
}

export interface CartPackage {
  id: string
  name: string
  description: string
  serviceIds: string[]
  discountPercent: number
  eligible: boolean
}

interface CartState {
  items: CartItem[]
  eventDate: string
  eventLocation: string
  packages: CartPackage[]
  appliedPackage?: CartPackage
  contactInfo: {
    name: string
    email: string
    phone: string
    notes: string
  }
}

type CartAction = 
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; serviceId: string }
  | { type: 'UPDATE_QUANTITY'; serviceId: string; quantity: number }
  | { type: 'UPDATE_EVENT_DATE'; date: string }
  | { type: 'UPDATE_EVENT_LOCATION'; location: string }
  | { type: 'UPDATE_CONTACT'; field: string; value: string }
  | { type: 'APPLY_PACKAGE'; package: CartPackage }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; state: CartState }

const initialState: CartState = {
  items: [],
  eventDate: '',
  eventLocation: '',
  packages: [],
  contactInfo: {
    name: '',
    email: '',
    phone: '',
    notes: ''
  }
}

// Pre-defined service packages with discounts
export const SERVICE_PACKAGES: CartPackage[] = [
  {
    id: 'wedding-basic',
    name: 'Wedding Basic Package',
    description: 'Canopy + Chairs + Sound System + MC',
    serviceIds: ['canopy-tent-hire', 'plastic-chair-hire', 'sound-system-hire', 'mc-services'],
    discountPercent: 15,
    eligible: false
  },
  {
    id: 'wedding-premium',
    name: 'Wedding Premium Package', 
    description: 'Full wedding setup with entertainment',
    serviceIds: ['canopy-tent-hire', 'plastic-chair-hire', 'sound-system-hire', 'mc-services', 'dj-services', 'live-band'],
    discountPercent: 20,
    eligible: false
  },
  {
    id: 'birthday-party',
    name: 'Birthday Party Package',
    description: 'Chairs + Sound + DJ + Coolers',
    serviceIds: ['plastic-chair-hire', 'sound-system-hire', 'dj-services', 'cooler-hire'],
    discountPercent: 12,
    eligible: false
  },
  {
    id: 'corporate-event',
    name: 'Corporate Event Package',
    description: 'Professional setup for business events',
    serviceIds: ['canopy-tent-hire', 'plastic-chair-hire', 'sound-system-hire', 'mc-services'],
    discountPercent: 10,
    eligible: false
  },
  {
    id: 'outdoor-gathering',
    name: 'Outdoor Gathering Package',
    description: 'Complete outdoor event setup',
    serviceIds: ['canopy-tent-hire', 'plastic-chair-hire', 'cooler-hire', 'bus-hire'],
    discountPercent: 8,
    eligible: false
  }
]

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already exists, update quantity instead
      const existingIndex = state.items.findIndex(item => item.serviceId === action.item.serviceId)
      
      if (existingIndex >= 0) {
        const updatedItems = [...state.items]
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + action.item.quantity,
          totalPrice: (updatedItems[existingIndex].quantity + action.item.quantity) * updatedItems[existingIndex].unitPrice
        }
        return { 
          ...state, 
          items: updatedItems,
          packages: checkPackageEligibility(updatedItems, SERVICE_PACKAGES)
        }
      }
      
      const newItems = [...state.items, action.item]
      return { 
        ...state, 
        items: newItems,
        packages: checkPackageEligibility(newItems, SERVICE_PACKAGES)
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.serviceId !== action.serviceId)
      return { 
        ...state, 
        items: newItems,
        packages: checkPackageEligibility(newItems, SERVICE_PACKAGES),
        appliedPackage: state.appliedPackage && 
          state.appliedPackage.serviceIds.includes(action.serviceId) ? undefined : state.appliedPackage
      }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', serviceId: action.serviceId })
      }
      
      const newItems = state.items.map(item =>
        item.serviceId === action.serviceId
          ? { ...item, quantity: action.quantity, totalPrice: action.quantity * item.unitPrice }
          : item
      )
      return { 
        ...state, 
        items: newItems,
        packages: checkPackageEligibility(newItems, SERVICE_PACKAGES)
      }
    }
    
    case 'UPDATE_EVENT_DATE':
      return { ...state, eventDate: action.date }
    
    case 'UPDATE_EVENT_LOCATION':
      return { ...state, eventLocation: action.location }
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contactInfo: {
          ...state.contactInfo,
          [action.field]: action.value
        }
      }
    
    case 'APPLY_PACKAGE':
      return { ...state, appliedPackage: action.package }
    
    case 'CLEAR_CART':
      return initialState
    
    case 'LOAD_CART':
      return action.state
    
    default:
      return state
  }
}

// Check which packages are eligible based on cart contents
function checkPackageEligibility(items: CartItem[], packages: CartPackage[]): CartPackage[] {
  return packages.map(pkg => ({
    ...pkg,
    eligible: pkg.serviceIds.every(serviceId => 
      items.some(item => item.serviceId === serviceId)
    )
  }))
}

// Cart calculations
export function calculateCartTotals(state: CartState) {
  const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
  
  let discount = 0
  if (state.appliedPackage) {
    discount = Math.round(subtotal * (state.appliedPackage.discountPercent / 100))
  }
  
  const tax = Math.round((subtotal - discount) * 0.075) // 7.5% VAT
  const total = subtotal - discount + tax
  
  return {
    subtotal,
    discount,
    tax,
    total,
    itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    savings: discount
  }
}

// Context
const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  totals: ReturnType<typeof calculateCartTotals>
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void
  removeFromCart: (serviceId: string) => void
  updateQuantity: (serviceId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (serviceId: string) => boolean
  getCartItem: (serviceId: string) => CartItem | undefined
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hotelsaver-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', state: parsedCart })
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hotelsaver-cart', JSON.stringify(state))
  }, [state])
  
  const totals = calculateCartTotals(state)
  
  const addToCart = (item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const cartItem: CartItem = {
      ...item,
      id: `${item.serviceId}-${Date.now()}`,
      totalPrice: item.quantity * item.unitPrice
    }
    dispatch({ type: 'ADD_ITEM', item: cartItem })
  }
  
  const removeFromCart = (serviceId: string) => {
    dispatch({ type: 'REMOVE_ITEM', serviceId })
  }
  
  const updateQuantity = (serviceId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', serviceId, quantity })
  }
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }
  
  const isInCart = (serviceId: string) => {
    return state.items.some(item => item.serviceId === serviceId)
  }
  
  const getCartItem = (serviceId: string) => {
    return state.items.find(item => item.serviceId === serviceId)
  }
  
  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      totals,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getCartItem
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}