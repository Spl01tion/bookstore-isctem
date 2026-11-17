export type Token = {
  token: string
  authenticated: boolean
}

export type TokenResponse = {
  code: number
  message?: string
  data: Token
}