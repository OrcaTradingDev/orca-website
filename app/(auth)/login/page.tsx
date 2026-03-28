'use client'

import { Waves } from 'lucide-react'
import './login.css'

function handleGoogleLogin() {
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__blob-pattern" aria-hidden="true" />
      <div className="login-page__blob-tr"      aria-hidden="true" />
      <div className="login-page__blob-bl"      aria-hidden="true" />

      <header className="login-page__header">
        <a href="/" className="login-page__logo-link">
          <Waves color="#3cd7ff" size={28} strokeWidth={2.5} />
          <span className="login-page__logo-text">OrcaTrading</span>
        </a>
      </header>

      <main className="login-page__main">
        <div className="auth-card">
          <div className="auth-card__hero">
            <div className="auth-card__icon-wrap">
              <Waves color="#3cd7ff" size={28} strokeWidth={2.5} />
            </div>
            <h1 className="auth-card__title">Welcome to OrcaTrading</h1>
            <p className="auth-card__subtitle">
              Sign in or create an account to get started.
            </p>
          </div>

          <button className="auth-btn auth-btn--google" onClick={handleGoogleLogin}>
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-card__legal">
            <p className="auth-card__legal-main">
              By continuing, you agree to our{' '}
              <a href="/terms">Terms of Service</a>{' '}and{' '}
              <a href="/privacy">Privacy Policy</a>
            </p>
            <p className="auth-card__legal-sub">
              Your account will be created automatically on first sign‑in.
            </p>
          </div>
        </div>
      </main>

      <footer className="login-page__footer">
        <span className="login-page__footer-copy">
          © {new Date().getFullYear()} OrcaTrading. Trusted by 10,000+ traders.
        </span>
        <div className="login-page__footer-links">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </footer>
    </div>
  )
}
