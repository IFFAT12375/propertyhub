import { useState } from 'react'
import { Building2, LayoutDashboard, MessageSquare, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import fallbackImage from '../assets/property-placeholder.svg'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import { useGetSellerPropertiesQuery, useUpdateAvailabilityMutation, useArchivePropertyMutation } from '../services/api/propertiesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'
import { formatPrice } from '../utils/properties.js'

const pageSize = 20
const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard },
  { to: '/seller/properties', label: 'My properties', icon: Building2, end: true },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function SellerProperties() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error, refetch } = useGetSellerPropertiesQuery({ page, limit: pageSize })
  const [updateAvailability, { isLoading: isUpdatingAvailability }] = useUpdateAvailabilityMutation()
  const [archiveProperty, { isLoading: isArchiving }] = useArchivePropertyMutation()
  const properties = data?.properties || []
  const [message, setMessage] = useState('')
  const [requestError, setRequestError] = useState('')

  async function handleAvailabilityChange(property, availabilityStatus) {
    setRequestError('')
    setMessage('')
    try {
      await updateAvailability({ id: property.id, availabilityStatus }).unwrap()
      setMessage(`${property.title || 'Property'} availability updated.`)
    } catch (mutationError) {
      setRequestError(apiErrorMessage(mutationError))
    }
  }

  async function handleArchive(property) {
    if (!window.confirm(`Archive “${property.title || 'this property'}”? Its history will be retained.`)) return
    setRequestError('')
    setMessage('')
    try {
      await archiveProperty(property.id).unwrap()
      setMessage(`${property.title || 'Property'} was archived.`)
    } catch (mutationError) {
      setRequestError(apiErrorMessage(mutationError))
    }
  }

  return (
    <DashboardLayout
      title="My properties"
      description="Manage your own listings and their separate review and availability states."
      navigation={navigation}
    >
      <div className="dashboard-toolbar">
        <p>{data?.pagination?.totalItems ?? 0} properties in your workspace</p>
        <Button as="link" to="/seller/properties/new" size="small">
          <Plus size={16} /> Create listing
        </Button>
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      {isLoading ? (
        <p role="status">Loading your properties…</p>
      ) : error ? (
        <EmptyState
          title="Properties could not be loaded"
          description={apiErrorMessage(error)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : !properties.length ? (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Create a property listing to begin. New listings start pending review."
          action={<Button as="link" to="/seller/properties/new">Add a property</Button>}
        />
      ) : (
        <div className="seller-property-list" aria-busy={isFetching}>
          {properties.map((property) => {
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
                <img src={property.image || fallbackImage} alt="" />
                <div className="seller-property-item__content">
                  <div className="seller-property-item__title">
                    <div>
                      <strong>{property.title || 'Untitled property'}</strong>
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
                        ? `Rejected: ${property.rejectionReason || 'Edit your listing before resubmitting.'}`
                        : 'Moderation and availability are managed independently.'}
                  </p>
                  <div className="seller-property-item__actions">
                    {isArchived ? (
                      <Button variant="outline" size="small" disabled>Archived</Button>
                    ) : (
                      <Button as="link" to={`/seller/properties/${property.id}/edit`} variant="outline" size="small">
                        Edit listing
                      </Button>
                    )}
                    <FormField
                      as="select"
                      label={`Availability for ${property.title || 'property'}`}
                      value={property.availabilityStatus}
                      disabled={!canUpdateAvailability || isUpdatingAvailability || isFetching}
                      onChange={(event) => void handleAvailabilityChange(property, event.target.value)}
                      options={availabilityOptions}
                    />
                    {!isArchived && (
                      <button
                        className="text-button seller-property-item__archive"
                        type="button"
                        disabled={isArchiving}
                        onClick={() => void handleArchive(property)}
                      >
                        {isArchiving ? 'Archiving…' : 'Archive listing'}
                      </button>
                    )}
                    {property.moderationStatus === 'approved' &&
                      property.availabilityStatus === 'available' &&
                      !isArchived && (
                        <Link to={`/properties/${property.id}`}>View public page</Link>
                      )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Seller property pages">
          <Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
    </DashboardLayout>
  )
}
