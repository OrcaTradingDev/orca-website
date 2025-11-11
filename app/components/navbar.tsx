// app/components/layout/navbar.tsx
'use client'

import { useState } from 'react'

// Temporary: Mock user type (replace with real auth later)
type User = {
  name: string
  email: string
} | null

// Temporary: Toggle this to test logged-in/logged-out states
//const MOCK_USER: User = null // Change to { name: "John Doe", email: "john@example.com" } to test
const MOCK_USER: User = {
  name : "Gouransh Vaishnav",
  email : "gouransh29@gmail.com"
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Use mock user for now
  const user = MOCK_USER

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          {/* Logo */}
          <a href="/" className="navbar__logo">
            OrcaTrading
          </a>

          {/* Desktop Navigation */}
          <div className="navbar__desktop">
            <div className="navbar__links">
              <a href="#products" className="navbar__link">Products</a>
              <a href="#pricing" className="navbar__link">Pricing</a>
              {user && (
                <a href="/dashboard" className="navbar__link">Dashboard</a>
              )}
            </div>
            
            {user ? (
              // Logged in: Show user menu
              <UserMenu user={user} isOpen={isDropdownOpen} setIsOpen={setIsDropdownOpen} />
            ) : (
              // Logged out: Show auth buttons
              <div className="navbar__auth">
                <a href="/login" className="btn btn--ghost btn--sm">
                  Login
                </a>
                <a href="/signup" className="btn btn--primary btn--sm">
                  Sign Up
                </a>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              // X icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Hamburger icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="navbar__mobile">
            <a href="#products" className="navbar__mobile-link" onClick={handleLinkClick}>
              Products
            </a>
            <a href="#pricing" className="navbar__mobile-link" onClick={handleLinkClick}>
              Pricing
            </a>
            {user && (
              <a href="/dashboard" className="navbar__mobile-link" onClick={handleLinkClick}>
                Dashboard
              </a>
            )}
            
            <div className="navbar__mobile-divider" />
            
            {user ? (
              // Logged in: Mobile user menu
              <>
                <div className="navbar__mobile-user">
                  <Avatar name={user.name} />
                  <div>
                    <div className="navbar__mobile-user-name">{user.name}</div>
                    <div className="navbar__mobile-user-email">{user.email}</div>
                  </div>
                </div>
                <a href="/profile" className="navbar__mobile-link" onClick={handleLinkClick}>
                  Profile
                </a>
                <a href="/settings" className="navbar__mobile-link" onClick={handleLinkClick}>
                  Settings
                </a>
                <a href="/billing" className="navbar__mobile-link" onClick={handleLinkClick}>
                  Billing
                </a>
                <button className="btn btn--ghost" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Logout
                </button>
              </>
            ) : (
              // Logged out: Auth buttons
              <>
                <a href="/login" className="btn btn--ghost" style={{ width: '100%' }}>
                  Login
                </a>
                <a href="/signup" className="btn btn--primary" style={{ width: '100%' }}>
                  Sign Up
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

// Avatar Component
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="avatar">
      {initials}
    </div>
  )
}

// Desktop User Menu
function UserMenu({ 
  user, 
  isOpen, 
  setIsOpen 
}: { 
  user: { name: string; email: string }
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  return (
    <div className="user-menu">
      <button 
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <Avatar name={user.name} />
        <span className="user-menu__name">{user.name}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <polyline points="4,6 8,10 12,6" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to close menu when clicking outside */}
          <div 
            className="user-menu__backdrop" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="user-menu__dropdown">
            <div className="user-menu__header">
              <div className="user-menu__header-name">{user.name}</div>
              <div className="user-menu__header-email">{user.email}</div>
            </div>
            
            <div className="user-menu__divider" />
            
            <a href="/dashboard" className="user-menu__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </a>
            
            <a href="/profile" className="user-menu__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </a>
            
            <a href="/settings" className="user-menu__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m5.196-13.196l-4.242 4.242m-2.828 2.828l-4.242 4.242m15.556-2.828l-4.242-4.242m-2.828-2.828l-4.242-4.242" />
              </svg>
              Settings
            </a>

            <a href="/billing" className="user-menu__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Billing
            </a>
            
            <div className="user-menu__divider" />
            
            <button className="user-menu__item user-menu__item--danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
