export type BookImage = {
  id: string
  url: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type Publisher = {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type Book = {
  id: string
  title: string
  slug: string
  description: string
  author: string
  size: string
  pages: number
  weight: number
  publishYear: number
  importPrice: number
  price: number
  discountPrice: number
  stock: number
  sold: number
  discount: Discount
  isNew: boolean
  isFeatured: boolean
  status: boolean
  category: Category
  publisher: Publisher
  bookImages: BookImage[]
  createdAt: string
  updatedAt: string
}

export type BookResponse = {
  code: number
  message?: string
  data: Book
}

export type BookListResponse = {
  code: number
  message?: string
  data: {
    pageNo: number
    pageSize: number
    totalPages: number
    items: Book[]
  }
}

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

export interface BooksResponse {
  code: number
  message: string
  data: Book[]
}
