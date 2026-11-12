import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Button from '../components/common/Button.jsx'
import { useGetAdminPropertiesQuery, useGetAdminSellerApplicationsQuery, useGetAdminUsersQuery } from '../services/api/adminApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminDashboard() {
  const applications = useGetAdminSellerApplicationsQuery({ page: 1, limit: 1, status: 'pending' })
  const properties = useGetAdminPropertiesQuery({ page: 1, limit: 1, moderationStatus: 'pending' })
  const activeSellers = useGetAdminUsersQuery({ page: 1, limit: 1, role: 'seller', accountStatus: 'active' })
  const registeredUsers = useGetAdminUsersQuery({ page: 1, limit: 1, role: 'user' })
  const queries = [applications, properties, activeSellers, registeredUsers]
  const firstError = queries.find(({ error }) => error)?.error
  const isLoading = queries.some(({ isLoading: loading }) => loading)

  return (
    <DashboardLayout
      title="Admin overview"
      description="Review marketplace activity and outstanding decisions."
      navigation={navigation}
    >
      {isLoading ? (
        <p role="status">Loading marketplace statistics…</p>
      ) : firstError ? (
        <EmptyState
          title="Dashboard statistics could not be loaded"
          description={apiErrorMessage(firstError)}
          action={
            <Button
              variant="outline"
              onClick={() => queries.forEach(({ refetch }) => void refetch())}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <Link className="stat-card" to="/admin/seller-applications">
              <span>Pending seller applications</span>
              <strong>{applications.data?.pagination?.totalItems ?? 0}</strong>
              <small>Approval is separate from listing review</small>
            </Link>
            <Link className="stat-card" to="/admin/properties">
              <span>Pending properties</span>
              <strong>{properties.data?.pagination?.totalItems ?? 0}</strong>
              <small>Pending listings remain hidden publicly</small>
            </Link>
            <Link className="stat-card" to="/admin/users">
              <span>Active sellers</span>
              <strong>{activeSellers.data?.pagination?.totalItems ?? 0}</strong>
              <small>Suspended sellers’ listings stay hidden</small>
            </Link>
            <Link className="stat-card" to="/admin/users">
              <span>Registered users</span>
              <strong>{registeredUsers.data?.pagination?.totalItems ?? 0}</strong>
              <small>Database-backed user accounts</small>
            </Link>
          </div>
          <section className="admin-quick-links">
            <h2>Review queues</h2>
            <div>
              <Link to="/admin/seller-applications">
                <ClipboardCheck size={20} />
                <span><strong>Seller applications</strong><small>Review access requests and decisions</small></span>
              </Link>
              <Link to="/admin/properties">
                <Building2 size={20} />
                <span><strong>Property approvals</strong><small>Review listing details and moderation state</small></span>
              </Link>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  )
}
