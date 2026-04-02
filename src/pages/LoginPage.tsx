import LoginScreen from '../components/auth/LoginScreen'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { useEffect } from 'react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useStore(s => s.isLoggedIn)

  // If already logged in, redirect to where they came from or home
  useEffect(() => {
    if (isLoggedIn) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isLoggedIn, navigate, location.state])

  const handleAuthSuccess = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  return (
    <LoginScreen
      onAuthSuccess={handleAuthSuccess}
      onClose={() => navigate(-1)}
    />
  )
}
