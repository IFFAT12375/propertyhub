import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import PropertyForm from '../components/property/PropertyForm.jsx'
import {
  useCreatePropertyMutation,
  useDeletePropertyImageMutation,
  useGetSellerPropertyQuery,
  useUpdatePropertyMutation,
} from '../services/api/propertiesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function SellerPropertyForm({ mode = 'create' }) {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const { data: property, isLoading, error: propertyError, refetch } = useGetSellerPropertyQuery(propertyId, { skip: mode !== 'edit' })
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation()
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation()
  const [deletePropertyImage] = useDeletePropertyImageMutation()
  const [requestError, setRequestError] = useState('')

  async function handleSubmit(body) {
    setRequestError('')
    try {
      if (mode === 'edit') {
        await updateProperty({ id: property.id, body }).unwrap()
      } else {
        await createProperty(body).unwrap()
      }
      navigate('/seller/properties', { replace: true })
    } catch (error) {
      setRequestError(apiErrorMessage(error))
    }
  }

  async function handleDeleteImage(filename) {
    setRequestError('')
    try {
      await deletePropertyImage({ id: property.id, filename }).unwrap()
      return true
    } catch (error) {
      setRequestError(apiErrorMessage(error))
      return false
    }
  }

  if (mode === 'edit' && isLoading) {
    return <div className="account-page page-container" role="status">Loading your listing…</div>
  }

  if (mode === 'edit' && propertyError) {
    return (
      <div className="account-page page-container">
        <EmptyState
          title="This listing could not be loaded"
          description={apiErrorMessage(propertyError, 'Sellers can edit only their own property records.')}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
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
          onDeleteImage={handleDeleteImage}
          isSubmitting={isCreating || isUpdating}
          requestError={requestError}
          submitLabel={mode === 'edit' ? 'Submit changes for review' : 'Submit listing for review'}
        />
      </div>
    </div>
  )
}
