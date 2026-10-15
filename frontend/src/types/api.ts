export type UserRole = 'teacher' | 'student'

export type User = {
  id: number
  role: UserRole
  username: string
  full_name: string
  grade: number | null
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
  user: User
}
