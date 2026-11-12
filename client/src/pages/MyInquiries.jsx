import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useGetMyInquiriesQuery } from '../services/api/inquiriesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function MyInquiries() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error, refetch, isFetching } = useGetMyInquiriesQuery({ page, limit: 20 })
  const myInquiries = data?.inquiries || []

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Your activity"
        title="My inquiries"
        description="Review the property inquiries you have submitted."
      />
      {isLoading ? (
        <p role="status">Loading your inquiries…</p>
      ) : error ? (
        <EmptyState
          title="Your inquiries could not be loaded"
          description={apiErrorMessage(error)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : myInquiries.length ? (
        <div className="inquiry-list">
          {myInquiries.map((inquiry) => (
            <article className="inquiry-item" key={inquiry.id}>
              <div className="inquiry-item__header">
                <div>
                  {inquiry.property ? (
                    <Link to={`/properties/${inquiry.property.id}`}>
                      {inquiry.property.title || 'Property listing'}
                    </Link>
                  ) : (
                    <strong>Property listing</strong>
                  )}
                  <span>Submitted {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="inquiry-item__badges">
                  <Badge status={inquiry.verificationStatus} />
                  <Badge status={inquiry.followUpStatus} />
                </div>
              </div>
              <p>{inquiry.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries yet"
          description="When you ask about a property, your inquiry status will appear here."
        />
      )}
      {data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Inquiry pages">
          <Button
            variant="outline"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <Button
            variant="outline"
            disabled={page >= data.pagination.totalPages || isFetching}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}
