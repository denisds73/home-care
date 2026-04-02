import { api } from './api'
import type { User } from '../types/domain'

export interface LoginDto {
  email: string
  password?: string // optional for now since it's a demo
}

export const authService = {
  login: (data: LoginDto) => api.post<{ user: User; token: string }>('/auth/login', data),
  signup: (data: Partial<User> & LoginDto) => api.post<{ user: User; token: string }>('/auth/signup', data),
  logout: () => api.post('/auth/logout', {}),
  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
}
