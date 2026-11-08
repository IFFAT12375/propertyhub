import { useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useMarketplace } from '../context/useMarketplace.js'
import { formatPrice } from '../utils/properties.js'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminProperties() {
  const { properties, moderateProperty } = useMarketplace()
  const [reasons, setReasons] = useState({})
  const [message, setMessage] = useState('')
  const pending = properties.filter(
    (property) => property.moderationStatus === 'pending',
  )
  const otherProperties = properties.filter(
    (property) => property.moderationStatus !== 'pending',
  )

  function decide(property, decision) {
    const result = moderateProperty(
      property.id,
      decision,
      reasons[property.id] || '',
    )
    setMessage(
      result.success
        ? `${property.title} was ${decision}.`
        : result.message,
    )
  }

  return (
    <DashboardLayout
      title="Property approvals"
      description="Review listing content. Availability and seller status remain separate visibility conditions."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        Approving a listing changes moderation only. It is public only when its
        seller is active, its record is active, and its availability is available.
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      {pending.length ? (
        <div className="admin-review-list">
          {pending.map((property) => (
            <article className="admin-review-card admin-property-card" key={property.id}>
              <div className="admin-property-card__visual">
                <img src={property.image} alt={property.title} />
                <div className="admin-property-card__statuses">
                  <Badge status={property.moderationStatus} />
                  <Badge status={property.availabilityStatus} />
                </div>
              </div>
              <div className="admin-review-card__header">
                <div>
                  <span className="eyebrow">{property.category} · {property.type} · {property.purpose}</span>
                  <h2>{property.title}</h2>
                  <p>{property.location.area}, Lahore · {formatPrice(property.price, property.purpose, property.priceFrequency)}</p>
                </div>
              </div>
              <p className="admin-review-card__message">{property.description}</p>
              <dl className="admin-review-card__facts">
                <div><dt>Seller</dt><dd>{property.seller.name}</dd></div>
                <div><dt>Public phone</dt><dd>{property.seller.phoneVisible ? property.seller.phone : 'Hidden by seller'}</dd></div>
                <div><dt>Seller status</dt><dd>{property.sellerStatus}</dd></div>
              </dl>
              <FormField
                as="textarea"
                label="Rejection reason (required to reject)"
                value={reasons[property.id] || ''}
                onChange={(event) =>
                  setReasons((current) => ({
                    ...current,
                    [property.id]: event.target.value,
                  }))
                }
                placeholder="Describe the listing changes required."
              />
              <div className="admin-review-card__actions">
                <Button onClick={() => decide(property, 'approved')}>
                  Approve listing
                </Button>
                <Button
                  variant="outline"
                  disabled={!reasons[property.id]?.trim()}
                  onClick={() => decide(property, 'rejected')}
                >
                  Reject listing
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No listings are waiting for review"
          description="New and edited listings remain hidden until an administrator reviews them."
        />
      )}
      <details className="admin-history">
        <summary>Other listings ({otherProperties.length})</summary>
        <div className="admin-history__list">
          {otherProperties.map((property) => (
            <article className="admin-history__item" key={property.id}>
              <div>
                <strong>{property.title}</strong>
                <span>{property.location.area} · {property.seller.name}</span>
                {property.rejectionReason && <p>Reason: {property.rejectionReason}</p>}
              </div>
              <div className="seller-property-row__badges">
                <Badge status={property.moderationStatus} />
                <Badge status={property.availabilityStatus} />
              </div>
            </article>
          ))}
        </div>
      </details>
    </DashboardLayout>
  )
}
