import { Building2, LayoutDashboard, MessageSquare, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'
import { formatPrice } from '../utils/properties.js'

const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/seller/properties', label: 'My properties', icon: Building2 },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function SellerDashboard() {
  const { user } = useAuth()
  const { properties, inquiries } = useMarketplace()
  const ownedProperties = properties.filter((property) => property.ownerId === user.id)
  const ownedInquiries = inquiries.filter((inquiry) => {
    const property = ownedProperties.find((item) => item.id === inquiry.propertyId)
    return property && inquiry.verificationStatus === 'verified'
  })
  const availableCount = ownedProperties.filter(
    (property) =>
      property.recordStatus === 'active' &&
      property.availabilityStatus === 'available',
  ).length
  const pendingCount = ownedProperties.filter(
    (property) => property.moderationStatus === 'pending',
  ).length

  return (
    <DashboardLayout
      title={`Welcome, ${user.name.split(' ')[0]}`}
      description="Your seller activity at a glance."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        This seller workspace is a frontend prototype. Role checks and sample
        data do not provide real authorization or publish live listings.
      </div>
      <div className="stat-grid">
        <Link className="stat-card" to="/seller/properties">
          <span>Total properties</span>
          <strong>{ownedProperties.length}</strong>
          <small>Including archived records</small>
        </Link>
        <Link className="stat-card" to="/seller/properties">
          <span>Available</span>
          <strong>{availableCount}</strong>
          <small>Approved and available listings</small>
        </Link>
        <Link className="stat-card" to="/seller/properties">
          <span>Awaiting review</span>
          <strong>{pendingCount}</strong>
          <small>Not shown in public search</small>
        </Link>
        <Link className="stat-card" to="/seller/inquiries">
          <span>Verified inquiries</span>
          <strong>{ownedInquiries.length}</strong>
          <small>Unverified guest messages are hidden</small>
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
        {ownedProperties.slice(0, 4).map((property) => (
          <article className="seller-property-row" key={property.id}>
            <div className="seller-property-row__main">
              <strong>{property.title}</strong>
              <span>{property.location.area} · {formatPrice(property.price, property.purpose, property.priceFrequency)}</span>
            </div>
            <div className="seller-property-row__badges">
              <Badge status={property.moderationStatus} />
              <Badge status={property.availabilityStatus} />
            </div>
          </article>
        ))}
        {!ownedProperties.length && (
          <p className="dashboard-empty">
            You haven’t created a property listing yet.
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
