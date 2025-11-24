import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProductDiscountInfo } from '@/lib/utils/discounts'

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
  stock?: number // Available stock for this variant
  product_discounts?: Array<{
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    starts_at: string | null
    ends_at: string | null
    is_active: boolean
    can_combine_with_codediscount: boolean
  }> | null
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number // Total without discounts
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.size === item.size && i.color === item.color
          )
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size && i.color === item.color
                  ? { 
                      ...i, 
                      quantity: i.quantity + item.quantity,
                      // Update product_discounts if provided (in case they changed)
                      product_discounts: item.product_discounts ?? i.product_discounts
                    }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (id, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.size === size && i.color === color)
          ),
        })),
      updateQuantity: (id, quantity, size, color) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity
          const discountInfo = getProductDiscountInfo(
            itemTotal,
            item.product_discounts,
            item.quantity
          )
          return total + discountInfo.finalPrice
        }, 0)
      },
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

