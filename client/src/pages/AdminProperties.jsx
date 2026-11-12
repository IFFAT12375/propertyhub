import { useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import fallbackImage from '../assets/property-placeholder.svg'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useGetAdminPropertiesQuery, useReviewPropertyMutation } from '../services/api/adminApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'
import { formatPrice } from '../utils/properties.js'

const pageSize = 50
const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminProperties() {
  const [page, setPage] = useState(1)
  const pendingQuery = useGetAdminPropertiesQuery({ page, limit: pageSize, moderationStatus: 'pending' })
  const approvedQuery = useGetAdminPropertiesQuery({ page: 1, limit: pageSize, moderationStatus: 'approved' })
  const rejectedQuery = useGetAdminPropertiesQuery({ page: 1, limit: pageSize, moderationStatus: 'rejected' })
  const [reviewProperty, { isLoading: isReviewing }] = useReviewPropertyMutation()
  const [reasons, setReasons] = useState({})
  const [message, setMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const pending = pendingQuery.data?.properties || []
  const history = [
    ...(approvedQuery.data?.properties || []),
    ...(rejectedQuery.data?.properties || []),
  ].sort((left, right) => new Date(right.reviewedAt || right.createdAt) - new Date(left.reviewedAt || left.createdAt))
  const error = pendingQuery.error || approvedQuery.error || rejectedQuery.error
  const queries = [pendingQuery, approvedQuery, rejectedQuery]

  async function decide(property, moderationStatus) {
    setRequestError('')
    setMessage('')
    try {
      await reviewProperty({
        id: property.id,
        moderationStatus,
        ...(moderationStatus === 'rejected' ? { rejectionReason: reasons[property.id]?.trim() } : {}),
      }).unwrap()
      setMessage(`${property.title || 'Property'} was ${moderationStatus}.`)
    } catch (reviewError) {
      setRequestError(apiErrorMessage(reviewError))
    }
  }

  return (
    <DashboardLayout
      title="Property approvals"
      description="Review listing content. Availability and seller status remain separate visibility conditions."
      navigation={navigation}
    >
      {message && <div className="success-message" role="status">{message}</div>}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      {pendingQuery.isLoading ? (
        <p role="status">Loading property moderation queue…</p>
      ) : error ? (
        <EmptyState
          title="Property moderation data could not be loaded"
          description={apiErrorMessage(error)}
          action={
            <Button variant="outline" onClick={() => queries.forEach(({ refetch }) => void refetch())}>
              Try again
            </Button>
          }
        />
      ) : pending.length ? (
        <div className="admin-review-list">
          {pending.map((property) => (
            <article className="admin-review-card admin-property-card" key={property.id}>
              <div className="admin-property-card__visual">
                <img src={property.image || fallbackImage} alt={property.title || 'Property listing'} />
                <div className="admin-property-card__statuses">
                  <Badge status={property.moderationStatus} />
                  <Badge status={property.availabilityStatus} />
                </div>
              </div>
              <div className="admin-review-card__header">
                <div>
                  <span className="eyebrow">{property.category} · {property.type} · {property.purpose}</span>
                  <h2>{property.title || 'Untitled property'}</h2>
                  <p>{property.location.area}, Lahore · {formatPrice(property.price, property.purpose, property.priceFrequency)}</p>
                </div>
              </div>
              <p className="admin-review-card__message">{property.description}</p>
              <dl className="admin-review-card__facts">
                <div><dt>Seller</dt><dd>{property.seller?.name || 'Seller'}</dd></div>
                <div><dt>Public phone</dt><dd>{property.phoneVisible ? property.seller?.phone || 'Not provided' : 'Hidden by seller'}</dd></div>
                <div><dt>Seller status</dt><dd>{property.sellerStatus || 'unknown'}</dd></div>
              </dl>
              <FormField
                as="textarea"
                label="Rejection reason (required to reject)"
                value={reasons[property.id] || ''}
                onChange={(event) => setReasons((current) => ({ ...current, [property.id]: event.target.value }))}
                placeholder="Describe the listing changes required."
              />
              <div className="admin-review-card__actions">
                <Button disabled={isReviewing} onClick={() => void decide(property, 'approved')}>
                  {isReviewing ? 'Saving…' : 'Approve listing'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isReviewing || !reasons[property.id]?.trim()}
                  onClick={() => void decide(property, 'rejected')}
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
      {pendingQuery.data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Property moderation pages">
          <Button variant="outline" disabled={page === 1 || pendingQuery.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {pendingQuery.data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= pendingQuery.data.pagination.totalPages || pendingQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
      <details className="admin-history">
        <summary>Reviewed listings ({(approvedQuery.data?.pagination?.totalItems || 0) + (rejectedQuery.data?.pagination?.totalItems || 0)})</summary>
        {(approvedQuery.data?.pagination?.totalItems || 0) + (rejectedQuery.data?.pagination?.totalItems || 0) > history.length && (
          <p>Showing the most recent {history.length} reviewed listings.</p>
        )}
        <div className="admin-history__list">
          {history.map((property) => (
            <article className="admin-history__item" key={property.id}>
              <div>
                <strong>{property.title || 'Untitled property'}</strong>
                <span>{property.location.area} · {property.seller?.name || 'Seller'}</span>
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
