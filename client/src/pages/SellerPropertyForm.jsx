import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import PropertyForm from '../components/property/PropertyForm.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

export default function SellerPropertyForm({ mode = 'create' }) {
  const { propertyId } = useParams()
  const { user } = useAuth()
  const { properties, createProperty, updateProperty } = useMarketplace()
  const navigate = useNavigate()
  const property =
    mode === 'edit'
      ? properties.find(
          (item) => item.id === propertyId && item.ownerId === user.id,
        )
      : null

  function handleSubmit(details) {
    if (mode === 'edit') {
      const updated = updateProperty(property.id, details, user.id)
      if (!updated) return
      navigate('/seller/properties', { replace: true })
      return
    }

    createProperty(details, user)
    navigate('/seller/properties', { replace: true })
  }

  if (mode === 'edit' && !property) {
    return (
      <div className="account-page page-container">
        <EmptyState
          title="This listing isn’t in your workspace"
          description="Sellers can edit only their own property records."
          action={<Button as="link" to="/seller/properties">Back to properties</Button>}
        />
      </div>
    )
  }

  return (
    <div className="seller-form-page page-container">
      <SectionHeading
        eyebrow={mode === 'edit' ? 'Update your listing' : 'New property'}
        title={mode === 'edit' ? 'Edit property details' : 'Create a property listing'}
        description={
          mode === 'edit'
            ? 'Submitting edits returns the listing to pending review and hides it from public search until approved.'
            : 'New listings are saved as pending and remain hidden from public search until approved.'
        }
      />
      {mode === 'edit' && property.moderationStatus === 'rejected' && (
        <div className="application-rejection" role="status">
          <strong>Administrator feedback</strong>
          <p>{property.rejectionReason || 'Please review your listing details and resubmit.'}</p>
        </div>
      )}
      <div className="application-form-card">
        <PropertyForm
          property={property}
          onSubmit={handleSubmit}
          submitLabel={mode === 'edit' ? 'Submit changes for review' : 'Submit listing for review'}
        />
      </div>
    </div>
  )
}
