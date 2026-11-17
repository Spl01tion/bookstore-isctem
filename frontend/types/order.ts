export type OrderDetailRequest = {
  bookId: string
  quantity: number
  price: number
}

export type OrderDetail = {
  bookTitle: string
  slug: string
  bookImages: { id: string, url: string }[]
  quantity: number
  price: number
}

export enum PaymentMethod {
  COD = 'COD',
  VN_PAY = 'VN_PAY'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export type Order = {
  id: string
  receiverName: string
  receiverPhone: string
  address: string
  paymentMethod: PaymentMethod
  orderStatus: OrderStatus
  total: number
  userId?: string
  orderDetails: OrderDetail[]
  createdAt: string
  updatedAt: string
}

export type OrderResponse = {
  code: number
  message?: string
  data: Order
}

export type ListOrdersResponse = {
  code: number
  message?: string
  data: {
    pageNo: number
    pageSize: number
    totalPages: number
    items: Order[]
  }
}