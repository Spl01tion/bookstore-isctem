import { create } from 'zustand'
import { Book } from '@/types/book'
import { OrderStatus, PaymentMethod } from '@/types/order'

type OrderDetail = {
  book: Book
  quantity: number
  price: number
}

type OrderStore = {
  userId: string
  receiverName: string
  receiverPhone: string
  address: string
  paymentMethod: PaymentMethod
  orderStatus: OrderStatus
  total: number
  orderDetails: OrderDetail[]

  setUserId: (userId: string) => void
  setReceiverName: (receiverName: string) => void
  setReceiverPhone: (receiverPhone: string) => void
  setAddress: (address: string) => void
  setPaymentMethod: (paymentMethod: PaymentMethod) => void
  setOrderStatus: (orderStatus: OrderStatus) => void
  setTotal: (total: number) => void
  setOrderDetails: (orderDetails: OrderDetail[]) => void
}

export const useOrderStore = create<OrderStore>(set => ({
  userId: '',
  receiverName: '',
  receiverPhone: '',
  address: '',
  paymentMethod: PaymentMethod.COD,
  orderStatus: OrderStatus.PENDING,
  total: 0,
  orderDetails: [],

  setUserId: userId => set({ userId }),
  setReceiverName: receiverName => set({ receiverName }),
  setReceiverPhone: receiverPhone => set({ receiverPhone }),
  setAddress: address => set({ address }),
  setPaymentMethod: paymentMethod => set({ paymentMethod }),
  setOrderStatus: orderStatus => set({ orderStatus }),
  setTotal: total => set({ total }),
  setOrderDetails: orderDetails => set({ orderDetails }),
}))
