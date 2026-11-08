import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

export default function MyInquiries() {
  const { user } = useAuth()
  const { inquiries, properties } = useMarketplace()
  const myInquiries = inquiries
    .filter((inquiry) => inquiry.seekerId === user.id)
    .map((inquiry) => ({
      ...inquiry,
      property: properties.find((property) => property.id === inquiry.propertyId),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Your activity"
        title="My inquiries"
        description="Review the property inquiries you have submitted in this demo."
      />
      {myInquiries.length ? (
        <div className="inquiry-list">
          {myInquiries.map((inquiry) => (
            <article className="inquiry-item" key={inquiry.id}>
              <div className="inquiry-item__header">
                <div>
                  {inquiry.property ? (
                    <Link to={`/properties/${inquiry.property.id}`}>
                      {inquiry.property.title}
                    </Link>
                  ) : (
                    <strong>Property listing</strong>
                  )}
                  <span>Submitted {inquiry.createdAt}</span>
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
    </div>
  )
}
