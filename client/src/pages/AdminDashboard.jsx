import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminDashboard() {
  const { users } = useAuth()
  const { properties, applications } = useMarketplace()
  const pendingProperties = properties.filter(
    (property) => property.moderationStatus === 'pending',
  ).length
  const pendingApplications = applications.filter(
    (application) => application.status === 'pending',
  ).length
  const activeSellers = users.filter(
    (account) => account.role === 'seller' && account.status !== 'suspended',
  ).length

  return (
    <DashboardLayout
      title="Admin overview"
      description="Review marketplace activity and outstanding decisions."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        Admin routes and actions are mock UI only. The frontend does not enforce
        real administrative authorization or change backend records.
      </div>
      <div className="stat-grid">
        <Link className="stat-card" to="/admin/seller-applications">
          <span>Pending seller applications</span>
          <strong>{pendingApplications}</strong>
          <small>Approval is separate from listing review</small>
        </Link>
        <Link className="stat-card" to="/admin/properties">
          <span>Pending properties</span>
          <strong>{pendingProperties}</strong>
          <small>Pending listings remain hidden publicly</small>
        </Link>
        <Link className="stat-card" to="/admin/users">
          <span>Active sellers</span>
          <strong>{activeSellers}</strong>
          <small>Suspended sellers’ listings stay hidden</small>
        </Link>
        <Link className="stat-card" to="/admin/users">
          <span>Registered users</span>
          <strong>{users.length}</strong>
          <small>Demo accounts and in-session registrations</small>
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
    </DashboardLayout>
  )
}
