import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Button from '../components/common/Button.jsx'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, initialized } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!initialized) {
    return <div className="page-container section" role="status">Restoring your session…</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (
    (allowedRoles && !allowedRoles.includes(user.role)) ||
    (allowedRoles?.includes('seller') && user.accountStatus === 'suspended')
  ) {
    return (
      <div className="access-denied page-container" role="status">
        <span className="eyebrow">Access restricted</span>
        <h1>This workspace isn’t available for your account.</h1>
        <p>
          Your account does not have permission to access this area. Server-side
          authorization continues to protect all account and marketplace data.
        </p>
        <Button as="link" to="/">Return home</Button>
      </div>
    )
  }

  return children
}
