'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/app/store/authStore'
import './navbar.css'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { user, isHydrated, logout } = useAuthStore()

  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    handleLinkClick()
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          <a href="/" className="navbar__logo">
            OrcaTrading
          </a>

          <div className="navbar__desktop">
            <div className="navbar__links">
              <a href="#features" className="navbar__link">Features</a>
              <a href="#products" className="navbar__link">Products</a>
              <a href="#pricing" className="navbar__link">Pricing</a>
              {user && (
                <a href="/dashboard" className="navbar__link">Dashboard</a>
              )}
            </div>

            {!isHydrated ? (
              <div className="navbar__auth">
                <div
                  className="skeleton-loader"
                  style={{ width: '110px', height: '36px', borderRadius: '999px' }}
                />
              </div>
            ) : user ? (
              <UserMenu
                user={{
                  name: user.name ?? "Account",
                  email: user.email ?? "",
                  picture: user.picture ?? undefined,
                }}
                isOpen={isDropdownOpen}
                setIsOpen={setIsDropdownOpen}
                onLogout={handleLogout}
              />
            ) : (
              <div className="navbar__auth">
                <a href="/login" className="btn btn--primary btn--sm">
                  Get Started
                </a>
              </div>
            )}
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="navbar__mobile">
            <a href="#features" className="navbar__mobile-link" onClick={handleLinkClick}>Features</a>
            <a href="#products" className="navbar__mobile-link" onClick={handleLinkClick}>Products</a>
            <a href="#pricing" className="navbar__mobile-link" onClick={handleLinkClick}>Pricing</a>
            {user && (
              <a href="/dashboard" className="navbar__mobile-link" onClick={handleLinkClick}>Dashboard</a>
            )}

            <div className="navbar__mobile-divider" />

            {!isHydrated ? (
              <div className="skeleton-loader" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
            ) : user ? (
              <>
                <div className="navbar__mobile-user">
                  <Avatar user={{ name: user.name ?? "Account", picture: user.picture ?? undefined }} />
                  <div>
                    <div className="navbar__mobile-user-name">{user.name ?? "Account"}</div>
                    <div className="navbar__mobile-user-email">{user.email ?? ""}</div>
                  </div>
                </div>
                <a href="/dashboard" className="navbar__mobile-link" onClick={handleLinkClick}>Dashboard</a>
                <a href="/profile" className="navbar__mobile-link" onClick={handleLinkClick}>Profile</a>
                <a href="/settings" className="navbar__mobile-link" onClick={handleLinkClick}>Settings</a>
                <a href="/billing" className="navbar__mobile-link" onClick={handleLinkClick}>Billing</a>
                <button
                  className="btn btn--ghost"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <a href="/login" className="btn btn--primary" style={{ width: '100%' }}>
                Get Started
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function Avatar({ user }: { user: { name: string; picture?: string } }) {
  const [error, setError] = useState(false)

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (user.picture && !error) {
    return (
      <Image
        onError={() => setError(true)}
        src={user.picture}
        alt={`${user.name}'s profile`}
        width={36}
        height={36}
        className="avatar avatar--image"
      />
    )
  }
  return <div className="avatar">{initials}</div>
}

function UserMenu({
  user,
  isOpen,
  setIsOpen,
  onLogout,
}: {
  user: { name: string; email: string; picture?: string }
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onLogout: () => void
}) {
  return (
    <div className="user-menu">
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <Avatar user={user} />
        <span className="user-menu__name">{user.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="user-menu__backdrop" onClick={() => setIsOpen(false)} />

          <div className="user-menu__dropdown">
            <div className="user-menu__header">
              <div className="user-menu__header-name">{user.name}</div>
              <div className="user-menu__header-email">{user.email}</div>
            </div>

            <div className="user-menu__divider" />

            <a href="/dashboard" className="user-menu__item">Dashboard</a>
            <a href="/profile" className="user-menu__item">Profile</a>
            <a href="/settings" className="user-menu__item">Settings</a>
            <a href="/billing" className="user-menu__item">Billing</a>

            <div className="user-menu__divider" />

            <button className="user-menu__item user-menu__item--danger" onClick={onLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
