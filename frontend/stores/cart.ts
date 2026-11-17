import { create } from 'zustand/react'
import { CartItem } from '@/types/cart'

type CartType = {
  carts: CartItem[]
  addCart: (cart: CartItem) => void
  removeCart: (bookId: string) => void
  increaseQuantity: (bookId: string, quantity?: number) => void
  decreaseQuantity: (bookId: string) => void
}

const useCartStore = create<CartType>((set, get) => ({
  carts: [],

  addCart: (cart) => {
    set((state) => {
      const existingItem = state.carts.find(p => p.book.id === cart.book.id)
      if (existingItem) {
        existingItem.quantity += cart.quantity
      } else {
        state.carts.push(cart)
      }
      return { carts: [...state.carts] }
    })
  },
  removeCart: (bookId) => {
    set((state) => {
      const updatedCart = state.carts.filter(item => item.book.id !== bookId)
      return { carts: updatedCart }
    })
  },
  increaseQuantity: (bookId, quantity = 1) => {
    set((state) => {
      const updatedCart = state.carts.map(item => {
        if (item.book.id === bookId) {
          item.quantity += quantity
        }
        return item
      })
      return { carts: updatedCart }
    })
  },
  decreaseQuantity: (id) => {
    set((state) => {
      const updatedCart = state.carts.filter(item => {
        if (item.book.id === id) {
          item.quantity = Math.max(1, item.quantity - 1)
        }
        return true
      })
      return { carts: updatedCart }
    })
  },
}))

export { useCartStore }