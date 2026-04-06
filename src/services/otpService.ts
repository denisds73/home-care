import { api } from './api'

export const otpService = {
  sendOtp: (phone: string) =>
    api.post<{ data: { message: string } }>('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) =>
    api.post<{ data: { verified: boolean } }>('/auth/verify-otp', { phone, otp }),
}
