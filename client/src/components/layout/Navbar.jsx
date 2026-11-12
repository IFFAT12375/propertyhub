import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '../common/Button.jsx'
import { useLogoutMutation } from '../../services/api/authApi.js'
import { apiErrorMessage } from '../../utils/apiErrors.js'

const primaryLinks = [
  { to: '/properties?purpose=sale', label: 'Buy' },
  { to: '/properties?purpose=rent', label: 'Rent' },
  { to: '/seller/apply', label: 'List your property' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useSelector((state) => state.auth.user)
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [logoutError, setLogoutError] = useState('')

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <nav className="navbar page-container" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="PropertyHub home">
          <span className="brand__mark" aria-hidden="true">P</span>
          <span>property<span className="brand__hub">hub</span></span>
        </Link>
        <button
          className="navbar__toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <div
          className={`navbar__content${menuOpen ? ' navbar__content--open' : ''}`}
          id="primary-navigation"
        >
          <div className="navbar__links">
            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="navbar__link"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="navbar__actions">
            {user ? (
              <>
                <Button
                  as="link"
                  to={user.role === 'admin'
                    ? '/admin'
                    : user.role === 'seller' && user.accountStatus === 'active'
                      ? '/seller'
                      : '/profile'}
                  variant="text"
                  onClick={closeMenu}
                >
                  {user.name.split(' ')[0]}
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  disabled={isLoggingOut}
                  onClick={async () => {
                    setLogoutError('')
                    try {
                      await logout().unwrap()
                    } catch (error) {
                      setLogoutError(`${apiErrorMessage(error)} You have been signed out locally.`)
                    }
                    closeMenu()
                  }}
                >
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </Button>
              </>
            ) : (
              <>
                <Button as="link" to="/login" variant="text" onClick={closeMenu}>
                  Log in
                </Button>
                <Button as="link" to="/register" size="small" onClick={closeMenu}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
        {logoutError && <p className="form-alert" role="alert">{logoutError}</p>}
      </nav>
    </header>
  )
}