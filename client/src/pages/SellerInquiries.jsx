import { useState } from 'react'
import { Building2, LayoutDashboard, MessageSquare } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useGetSellerInquiriesQuery, useUpdateInquiryFollowUpMutation } from '../services/api/inquiriesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

const pageSize = 20
const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard },
  { to: '/seller/properties', label: 'My properties', icon: Building2 },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare, end: true },
]

export default function SellerInquiries() {
  const [page, setPage] = useState(1)
  const [followUpStatus, setFollowUpStatus] = useState('')
  const { data, isLoading, isFetching, error, refetch } = useGetSellerInquiriesQuery({
    page,
    limit: pageSize,
    ...(followUpStatus ? { followUpStatus } : {}),
  })
  const [updateFollowUp, { isLoading: isUpdating }] = useUpdateInquiryFollowUpMutation()
  const [requestError, setRequestError] = useState('')
  const [message, setMessage] = useState('')
  const inquiries = data?.inquiries || []

  async function handleStatusChange(inquiry, status) {
    if (status === 'new') return
    setRequestError('')
    setMessage('')
    try {
      await updateFollowUp({ id: inquiry.id, followUpStatus: status }).unwrap()
      setMessage('Inquiry follow-up status updated.')
    } catch (mutationError) {
      setRequestError(apiErrorMessage(mutationError))
    }
  }

  return (
    <DashboardLayout
      title="Property inquiries"
      description="Follow up with verified inquiries for your properties."
      navigation={navigation}
    >
      <div className="dashboard-toolbar">
        <p>{data?.pagination?.totalItems ?? 0} verified inquiries</p>
        <FormField
          as="select"
          label="Follow-up status"
          value={followUpStatus}
          onChange={(event) => {
            setFollowUpStatus(event.target.value)
            setPage(1)
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'new', label: 'New' },
            { value: 'contacted', label: 'Contacted' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      {isLoading ? (
        <p role="status">Loading verified inquiries…</p>
      ) : error ? (
        <EmptyState
          title="Inquiries could not be loaded"
          description={apiErrorMessage(error)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : inquiries.length ? (
        <div className="inquiry-list" aria-busy={isFetching}>
          {inquiries.map((inquiry) => (
            <article className="inquiry-item" key={inquiry.id}>
              <div className="inquiry-item__header">
                <div>
                  <strong>{inquiry.name}</strong>
                  <span>{inquiry.property?.title || 'Property listing'} · {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="inquiry-item__badges">
                  <Badge status={inquiry.verificationStatus} />
                  <Badge status={inquiry.followUpStatus} />
                </div>
              </div>
              <p>{inquiry.message}</p>
              <div className="seller-inquiry__contact">
                <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                {inquiry.phone && <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>}
              </div>
              <div className="seller-inquiry__status">
                <FormField
                  as="select"
                  label={`Follow-up status for ${inquiry.name}`}
                  value={inquiry.followUpStatus}
                  disabled={isUpdating}
                  onChange={(event) => void handleStatusChange(inquiry, event.target.value)}
                  options={[
                    ...(inquiry.followUpStatus === 'new' ? [{ value: 'new', label: 'New' }] : []),
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No verified inquiries yet"
          description="Verified messages for your properties will appear here."
        />
      )}
      {data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Seller inquiry pages">
          <Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
    </DashboardLayout>
  )
}
