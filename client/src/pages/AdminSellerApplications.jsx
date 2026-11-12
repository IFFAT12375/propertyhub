import { useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useGetAdminSellerApplicationsQuery, useReviewSellerApplicationMutation } from '../services/api/adminApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

const pageSize = 50
const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck, end: true },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSellerApplications() {
  const [page, setPage] = useState(1)
  const pendingQuery = useGetAdminSellerApplicationsQuery({ page, limit: pageSize, status: 'pending' })
  const approvedQuery = useGetAdminSellerApplicationsQuery({ page: 1, limit: pageSize, status: 'approved' })
  const rejectedQuery = useGetAdminSellerApplicationsQuery({ page: 1, limit: pageSize, status: 'rejected' })
  const [reviewApplication, { isLoading: isReviewing }] = useReviewSellerApplicationMutation()
  const [reasons, setReasons] = useState({})
  const [message, setMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const pending = pendingQuery.data?.applications || []
  const history = [
    ...(approvedQuery.data?.applications || []),
    ...(rejectedQuery.data?.applications || []),
  ].sort((left, right) => new Date(right.reviewedAt || right.createdAt) - new Date(left.reviewedAt || left.createdAt))
  const error = pendingQuery.error || approvedQuery.error || rejectedQuery.error
  const queries = [pendingQuery, approvedQuery, rejectedQuery]

  async function decide(application, status) {
    setRequestError('')
    setMessage('')
    try {
      await reviewApplication({
        id: application.id,
        status,
        ...(status === 'rejected' ? { rejectionReason: reasons[application.id]?.trim() } : {}),
      }).unwrap()
      setMessage(`${application.applicantName} was ${status}.`)
    } catch (reviewError) {
      setRequestError(apiErrorMessage(reviewError))
    }
  }

  return (
    <DashboardLayout
      title="Seller applications"
      description="Review seller access requests separately from property listing approvals."
      navigation={navigation}
    >
      {message && <div className="success-message" role="status">{message}</div>}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      {pendingQuery.isLoading ? (
        <p role="status">Loading seller applications…</p>
      ) : error ? (
        <EmptyState
          title="Seller applications could not be loaded"
          description={apiErrorMessage(error)}
          action={
            <Button variant="outline" onClick={() => queries.forEach(({ refetch }) => void refetch())}>
              Try again
            </Button>
          }
        />
      ) : pending.length ? (
        <div className="admin-review-list">
          {pending.map((application) => (
            <article className="admin-review-card" key={application.id}>
              <div className="admin-review-card__header">
                <div>
                  <span className="eyebrow">Seller access request</span>
                  <h2>{application.applicantName}</h2>
                  <p>{application.email} · {application.phone}</p>
                </div>
                <Badge status={application.status} />
              </div>
              <dl className="admin-review-card__facts">
                <div><dt>Applicant type</dt><dd>{application.sellerType === 'agent' ? 'Real estate agent' : 'Property owner'}</dd></div>
                {application.agencyName && <div><dt>Agency</dt><dd>{application.agencyName}</dd></div>}
                <div><dt>Submitted</dt><dd>{new Date(application.createdAt).toLocaleDateString()}</dd></div>
              </dl>
              <p className="admin-review-card__message">{application.message}</p>
              <FormField
                as="textarea"
                label="Rejection reason (required to reject)"
                value={reasons[application.id] || ''}
                onChange={(event) => setReasons((current) => ({ ...current, [application.id]: event.target.value }))}
                placeholder="Explain what the applicant should address before reapplying."
              />
              <div className="admin-review-card__actions">
                <Button disabled={isReviewing} onClick={() => void decide(application, 'approved')}>
                  {isReviewing ? 'Saving…' : 'Approve seller'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isReviewing || !reasons[application.id]?.trim()}
                  onClick={() => void decide(application, 'rejected')}
                >
                  Reject application
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No applications are waiting"
          description="New seller access requests will appear in this queue."
        />
      )}
      {pendingQuery.data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Seller application pages">
          <Button variant="outline" disabled={page === 1 || pendingQuery.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {pendingQuery.data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= pendingQuery.data.pagination.totalPages || pendingQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
      <details className="admin-history">
        <summary>Decision history ({(approvedQuery.data?.pagination?.totalItems || 0) + (rejectedQuery.data?.pagination?.totalItems || 0)})</summary>
        {(approvedQuery.data?.pagination?.totalItems || 0) + (rejectedQuery.data?.pagination?.totalItems || 0) > history.length && (
          <p>Showing the most recent {history.length} decisions.</p>
        )}
        <div className="admin-history__list">
          {history.map((application) => (
            <article className="admin-history__item" key={application.id}>
              <div>
                <strong>{application.applicantName}</strong>
                <span>{application.email}</span>
                {application.rejectionReason && <p>{application.rejectionReason}</p>}
              </div>
              <Badge status={application.status} />
            </article>
          ))}
        </div>
      </details>
    </DashboardLayout>
  )
}
