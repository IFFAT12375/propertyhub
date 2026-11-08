import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import Button from '../components/common/Button.jsx'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied page-container" role="status">
        <span className="eyebrow">Prototype access</span>
        <h1>This workspace isn’t available for this demo role.</h1>
        <p>
          Role-based routing is a frontend demonstration only and does not
          provide real authorization.
        </p>
        <Button as="link" to="/">Return home</Button>
      </div>
    )
  }

  return children
}
