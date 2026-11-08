import { useState } from 'react'
import { Building2, LayoutDashboard, MessageSquare, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'
import { formatPrice } from '../utils/properties.js'

const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard },
  { to: '/seller/properties', label: 'My properties', icon: Building2, end: true },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function SellerProperties() {
  const { user } = useAuth()
  const { properties, updateAvailability, softDeleteProperty } = useMarketplace()
  const ownedProperties = properties.filter((property) => property.ownerId === user.id)
  const [message, setMessage] = useState('')

  function handleAvailabilityChange(property, status) {
    const updated = updateAvailability(property.id, status, user.id)
    setMessage(
      updated
        ? `${property.title} availability updated.`
        : 'That availability change is not valid for this property.',
    )
  }

  function handleArchive(property) {
    const updated = softDeleteProperty(property.id, user.id)
    setMessage(
      updated
        ? `${property.title} was archived. Its history remains in this demo.`
        : 'The property could not be archived.',
    )
  }

  return (
    <DashboardLayout
      title="My properties"
      description="Manage your own listings and their separate review and availability states."
      navigation={navigation}
    >
      <div className="dashboard-toolbar">
        <p>{ownedProperties.length} properties in your workspace</p>
        <Button as="link" to="/seller/properties/new" size="small">
          <Plus size={16} /> Create listing
        </Button>
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      {!ownedProperties.length ? (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Create a property listing to begin. New listings start pending review."
          action={<Button as="link" to="/seller/properties/new">Add a property</Button>}
        />
      ) : (
        <div className="seller-property-list">
          {ownedProperties.map((property) => {
            const isArchived = property.recordStatus !== 'active'
            const canUpdateAvailability =
              property.moderationStatus === 'approved' && !isArchived
            const availabilityOptions = [
              { value: 'available', label: 'Available' },
              ...(property.purpose === 'sale'
                ? [{ value: 'sold', label: 'Sold' }]
                : [{ value: 'rented', label: 'Rented' }]),
              { value: 'inactive', label: 'Inactive' },
            ]

            return (
              <article className="seller-property-item" key={property.id}>
                <img src={property.image} alt="" />
                <div className="seller-property-item__content">
                  <div className="seller-property-item__title">
                    <div>
                      <strong>{property.title}</strong>
                      <span>
                        {property.location.area} · {formatPrice(
                          property.price,
                          property.purpose,
                          property.priceFrequency,
                        )}
                      </span>
                    </div>
                    <div className="seller-property-row__badges">
                      <Badge status={property.moderationStatus} />
                      {isArchived ? (
                        <Badge tone="neutral">Archived</Badge>
                      ) : (
                        <Badge status={property.availabilityStatus} />
                      )}
                    </div>
                  </div>
                  <p>
                    {property.moderationStatus === 'pending'
                      ? 'Hidden from public search while awaiting review.'
                      : property.moderationStatus === 'rejected'
                        ? 'Review the decision and edit your listing before resubmitting.'
                        : 'Moderation and availability are managed independently.'}
                  </p>
                  <div className="seller-property-item__actions">
                    {isArchived ? (
                      <Button variant="outline" size="small" disabled>
                        Archived
                      </Button>
                    ) : (
                      <Button
                        as="link"
                        to={`/seller/properties/${property.id}/edit`}
                        variant="outline"
                        size="small"
                      >
                        Edit listing
                      </Button>
                    )}
                    <FormField
                      as="select"
                      label={`Availability for ${property.title}`}
                      value={property.availabilityStatus}
                      disabled={!canUpdateAvailability}
                      onChange={(event) =>
                        handleAvailabilityChange(property, event.target.value)
                      }
                      options={availabilityOptions}
                    />
                    {!isArchived && (
                      <button
                        className="text-button seller-property-item__archive"
                        type="button"
                        onClick={() => handleArchive(property)}
                      >
                        Archive listing
                      </button>
                    )}
                    {property.moderationStatus === 'approved' &&
                      property.availabilityStatus === 'available' && (
                        <Link to={`/properties/${property.id}`}>View public page</Link>
                      )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
