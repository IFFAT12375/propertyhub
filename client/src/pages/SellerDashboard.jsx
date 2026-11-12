import { Building2, LayoutDashboard, MessageSquare, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useGetSellerPropertiesQuery } from '../services/api/propertiesApi.js'
import { useGetSellerInquiriesQuery } from '../services/api/inquiriesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'
import { formatPrice } from '../utils/properties.js'

const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/seller/properties', label: 'My properties', icon: Building2 },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function SellerDashboard() {
  const user = useSelector((state) => state.auth.user)
  const { data, isLoading, error: propertyError, refetch } = useGetSellerPropertiesQuery({ page: 1, limit: 100 })
  const {
    data: inquiryData,
    error: inquiryError,
    refetch: refetchInquiries,
  } = useGetSellerInquiriesQuery({ page: 1, limit: 1 })
  const properties = data?.properties || []
  const availableCount = properties.filter(
    (property) => property.recordStatus === 'active' && property.availabilityStatus === 'available',
  ).length
  const pendingCount = properties.filter((property) => property.moderationStatus === 'pending').length

  return (
    <DashboardLayout
      title={`Welcome, ${user.name.split(' ')[0]}`}
      description="Your seller activity at a glance."
      navigation={navigation}
    >
      {isLoading ? (
        <p role="status">Loading your seller workspace…</p>
      ) : propertyError ? (
        <EmptyState
          title="Seller properties could not be loaded"
          description={apiErrorMessage(propertyError)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : (
        <>
          {(inquiryError) && (
            <div className="form-alert" role="alert">
              Inquiry count unavailable: {apiErrorMessage(inquiryError)}{' '}
              <Button variant="text" size="small" onClick={refetchInquiries}>Retry</Button>
            </div>
          )}
          <div className="stat-grid">
            <Link className="stat-card" to="/seller/properties">
              <span>Total properties</span>
              <strong>{data?.pagination?.totalItems ?? 0}</strong>
              <small>Including archived records</small>
            </Link>
            <Link className="stat-card" to="/seller/properties">
              <span>Available in loaded listings</span>
              <strong>{availableCount}</strong>
              <small>{data?.pagination?.totalItems > properties.length ? 'Count from the first 100 records' : 'Approved and currently available'}</small>
            </Link>
            <Link className="stat-card" to="/seller/properties">
              <span>Awaiting review in loaded listings</span>
              <strong>{pendingCount}</strong>
              <small>{data?.pagination?.totalItems > properties.length ? 'Count from the first 100 records' : 'Hidden from public search'}</small>
            </Link>
            <Link className="stat-card" to="/seller/inquiries">
              <span>Verified inquiries</span>
              <strong>{inquiryData?.pagination?.totalItems ?? '—'}</strong>
              <small>Verified messages for your properties</small>
            </Link>
          </div>
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent properties</h2>
              <p>Changes to approved listings require administrator review.</p>
            </div>
            <Button as="link" to="/seller/properties/new" size="small">
              <Plus size={16} /> Add property
            </Button>
          </div>
          <div className="seller-property-list">
            {properties.slice(0, 4).map((property) => (
              <article className="seller-property-row" key={property.id}>
                <div className="seller-property-row__main">
                  <strong>{property.title || 'Untitled property'}</strong>
                  <span>{property.location.area} · {formatPrice(property.price, property.purpose, property.priceFrequency)}</span>
                </div>
                <div className="seller-property-row__badges">
                  <Badge status={property.moderationStatus} />
                  <Badge status={property.availabilityStatus} />
                </div>
              </article>
            ))}
            {!properties.length && (
              <p className="dashboard-empty">You haven’t created a property listing yet.</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
