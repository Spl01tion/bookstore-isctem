export type User = {
  id: string
  username: string
  name: string
  email: string
  avatar: string
  status: boolean
  roles: Role[]
  addresses: Address[]
  createdAt: string
  updatedAt: string
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type Role = {
  name: string
  description: string
}

export type Address = {
  id: string
  receiverName: string
  receiverPhone: string
  address: string
}

export type UserResponse = {
  code: number
  message?: string
  data: User
}

export type ListUserResponse = {
  code: number
  message?: string
  data: User[]
}

export type UserListResponse = {
  code: number
  message?: string
  data: {
    items: User[]
    totalPages: number
    pageNo: number
    pageSize: number
  }
}
