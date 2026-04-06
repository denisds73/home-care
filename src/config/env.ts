export const ENV = {
  // Use VITE_API_URL if defined, otherwise fallback to a mock/local URL
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_demo_key_123',
  GOOGLE_PLACES_KEY: import.meta.env.VITE_GOOGLE_PLACES_KEY || '',
  IS_DEV: import.meta.env.MODE === 'development',
}

export default ENV
