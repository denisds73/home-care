import { ENV } from '../config/env'
import useStore from '../store/useStore'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Native fetch wrapper that automatically handles base URLs and Auth headers.
 */
async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${ENV.API_URL}${endpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // NOTE: You would normally add your auth token logic here:
  // const token = localStorage.getItem('token')
  // if (token) headers['Authorization'] = `Bearer ${token}`

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 401) {
      // Auto-logout on unauthorized
      useStore.getState().logout()
      useStore.getState().showToast('Session expired. Please log in again.', 'error')
      throw new ApiError(401, 'Unauthorized')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || 'Something went wrong')
    }

    return await response.json() as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new Error(err instanceof Error ? err.message : 'Network error')
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => fetchClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: any, options?: RequestInit) => fetchClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any, options?: RequestInit) => fetchClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any, options?: RequestInit) => fetchClient<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string, options?: RequestInit) => fetchClient<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default api
