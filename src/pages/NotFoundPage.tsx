import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center fade-in">
      <div className="max-w-md mx-auto">
        <div
          className="text-8xl sm:text-9xl font-extrabold font-brand mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 font-brand">
          Page Not Found
        </h1>
        <p className="text-secondary text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-base btn-primary px-8 py-3 rounded-full text-sm font-bold shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            Go Home
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-base btn-secondary px-8 py-3 rounded-full text-sm font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
