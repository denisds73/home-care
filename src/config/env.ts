function resolveApiUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  // When accessed from a LAN device (e.g. phone on same Wi-Fi),
  // use the same hostname so API calls reach the dev machine.
  const { hostname } = window.location
  return `http://${hostname}:3000/api`
}

export const ENV = {
  API_URL: resolveApiUrl(),
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_demo_key_123',
  GOOGLE_PLACES_KEY: import.meta.env.VITE_GOOGLE_PLACES_KEY || '',
  IS_DEV: import.meta.env.MODE === 'development',
}

export default ENV
