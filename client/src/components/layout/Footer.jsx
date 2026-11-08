import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer__main">
        <div className="site-footer__brand">
          <Link className="brand brand--footer" to="/">
            <span className="brand__mark" aria-hidden="true">P</span>
            <span>property<span className="brand__hub">hub</span></span>
          </Link>
          <p>Find a place to call yours, right here in Lahore.</p>
        </div>
        <div className="site-footer__location">
          <MapPin size={18} aria-hidden="true" />
          <span>Made for Lahore, Pakistan</span>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="page-container">
          <span>© {new Date().getFullYear()} PropertyHub</span>
          <span>Discover thoughtfully. Move confidently.</span>
        </div>
      </div>
    </footer>
  )
}