export interface Category {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  slug: string
  description: string
}

export interface CategoriesResponse {
  code: number
  message: string
  data: Category[]
}

export interface CategoryResponse {
  code: number
  message: string
  data: Category
}
