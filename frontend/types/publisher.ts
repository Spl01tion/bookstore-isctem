export interface Publisher {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  slug: string
  description: string
  image: string
  address: string
}

export interface PublisherResponse {
  code: number
  message: string
  data: Publisher[]
}
