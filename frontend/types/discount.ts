export interface Discount {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  code: string
  percent: number
  startDate: string
  endDate: string
}

export interface DiscountResponse {
  code: number
  message: string
  data: Discount[]
}
