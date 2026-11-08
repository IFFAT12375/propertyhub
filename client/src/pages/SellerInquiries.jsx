import { Building2, LayoutDashboard, MessageSquare } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

const navigation = [
  { to: '/seller', label: 'Overview', icon: LayoutDashboard },
  { to: '/seller/properties', label: 'My properties', icon: Building2 },
  { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare, end: true },
]

export default function SellerInquiries() {
  const { user } = useAuth()
  const { properties, inquiries, updateInquiryFollowUp } = useMarketplace()
  const ownedProperties = properties.filter((property) => property.ownerId === user.id)
  const verifiedInquiries = inquiries
    .filter(
      (inquiry) =>
        inquiry.verificationStatus === 'verified' &&
        ownedProperties.some((property) => property.id === inquiry.propertyId),
    )
    .map((inquiry) => ({
      ...inquiry,
      property: ownedProperties.find((property) => property.id === inquiry.propertyId),
    }))
  const pendingVerificationCount = inquiries.filter(
    (inquiry) =>
      inquiry.verificationStatus === 'pending' &&
      ownedProperties.some((property) => property.id === inquiry.propertyId),
  ).length

  function handleStatusChange(inquiry, status) {
    updateInquiryFollowUp(inquiry.id, status, user.id)
  }

  return (
    <DashboardLayout
      title="Property inquiries"
      description="Follow up with verified inquiries for your properties."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        Only verified inquiries are shown as genuine. Guest verification is not
        connected to email in this frontend prototype.
      </div>
      {pendingVerificationCount > 0 && (
        <p className="seller-inquiries__pending" role="status">
          {pendingVerificationCount} guest message
          {pendingVerificationCount === 1 ? ' is' : 's are'} waiting for email
          verification and will not be shown here.
        </p>
      )}
      {verifiedInquiries.length ? (
        <div className="inquiry-list">
          {verifiedInquiries.map((inquiry) => (
            <article className="inquiry-item" key={inquiry.id}>
              <div className="inquiry-item__header">
                <div>
                  <strong>{inquiry.name}</strong>
                  <span>{inquiry.property.title} · {inquiry.createdAt}</span>
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
                  onChange={(event) => handleStatusChange(inquiry, event.target.value)}
                  options={[
                    { value: 'new', label: 'New' },
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
    </DashboardLayout>
  )
}
