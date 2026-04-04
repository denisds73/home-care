import { api } from './api'
import type { User } from '../types/domain'

export interface LoginDto {
  email: string
  password: string
}

export interface SignupDto {
  name: string
  email: string
  password: string
  phone?: string
}

export const authService = {
  login: (data: LoginDto) =>
    api.post<{ data: { user: User; token: string } }>('/auth/login', data),
  signup: (data: SignupDto) =>
    api.post<{ data: { user: User; token: string } }>('/auth/signup', data),
  logout: () => api.post<{ data: null }>('/auth/logout', {}),
  getCurrentUser: () => api.get<{ data: { user: User } }>('/auth/me'),
}
