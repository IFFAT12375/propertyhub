import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '../common/Button.jsx'

const primaryLinks = [
  { to: '/properties?purpose=sale', label: 'Buy' },
  { to: '/properties?purpose=rent', label: 'Rent' },
  { to: '/seller/apply', label: 'List your property' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

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
            <Button as="link" to="/login" variant="text" onClick={closeMenu}>
              Log in
            </Button>
            <Button as="link" to="/register" size="small" onClick={closeMenu}>
              Get started
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}