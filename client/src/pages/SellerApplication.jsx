import { useState } from 'react'
import { ArrowRight, BadgeCheck, Clock3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import {
  useGetMyApplicationsQuery,
  useSubmitSellerApplicationMutation,
} from '../services/api/applicationsApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function SellerApplication() {
  const user = useSelector((state) => state.auth.user)
  const { data, isLoading, error, refetch } = useGetMyApplicationsQuery({ page: 1, limit: 50 })
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitSellerApplicationMutation()
  const applications = data?.applications || []
  const application = applications[0]
  const [values, setValues] = useState({
    sellerType: 'owner',
    agencyName: '',
    phone: user.phone || '',
    message: '',
  })
  const [requestError, setRequestError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setRequestError('')
    try {
      await submitApplication({
        sellerType: values.sellerType,
        ...(values.sellerType === 'agent' ? { agencyName: values.agencyName.trim() } : {}),
        phone: values.phone.trim(),
        message: values.message.trim(),
      }).unwrap()
    } catch (submitError) {
      setRequestError(apiErrorMessage(submitError))
    }
  }

  if (user.role === 'seller' && user.accountStatus === 'suspended') {
    return (
      <div className="account-page page-container">
        <div className="application-status application-status--pending">
          <h1>Seller access is suspended</h1>
          <p>Your profile and ordinary user features remain available. Seller operations are disabled.</p>
          <Button as="link" to="/profile">Go to profile</Button>
        </div>
      </div>
    )
  }

  if (user.role === 'seller') {
    return (
      <div className="account-page page-container">
        <div className="application-status application-status--approved">
          <BadgeCheck size={26} />
          <span className="eyebrow">Seller access approved</span>
          <h1>Your seller workspace is ready.</h1>
          <p>Manage your properties and follow-up with verified inquiries.</p>
          <Button as="link" to="/seller">Open seller dashboard</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="account-page page-container" role="status">Loading your application history…</div>
  }
  if (error) {
    return (
      <div className="account-page page-container">
        <EmptyState
          title="Application history could not be loaded"
          description={apiErrorMessage(error)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      </div>
    )
  }

  if (application?.status === 'pending') {
    return (
      <div className="account-page page-container">
        <div className="application-status application-status--pending">
          <Clock3 size={26} />
          <Badge status="pending" />
          <h1>Application submitted</h1>
          <p>Your application is awaiting administrator review.</p>
          <p>Submitted {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>
        {applications.length > 1 && <ApplicationHistory applications={applications.slice(1)} />}
      </div>
    )
  }

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Seller access"
        title={application?.status === 'rejected' ? 'Resubmit your application' : 'Apply to list with PropertyHub'}
        description="Seller access requires administrator approval before you can publish listings."
      />
      {application?.status === 'rejected' && (
        <div className="application-rejection" role="status">
          <Badge status="rejected" />
          <p>{application.rejectionReason || 'Please review your details and resubmit.'}</p>
        </div>
      )}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      <div className="application-form-card">
        <form className="seller-application-form" onSubmit={handleSubmit}>
          <FormField
            as="select"
            label="I am a"
            name="sellerType"
            value={values.sellerType}
            onChange={(event) => setValues((current) => ({ ...current, sellerType: event.target.value }))}
            options={[
              { value: 'owner', label: 'Property owner' },
              { value: 'agent', label: 'Real estate agent' },
            ]}
            required
          />
          {values.sellerType === 'agent' && (
            <FormField
              label="Agency name"
              name="agencyName"
              value={values.agencyName}
              onChange={(event) => setValues((current) => ({ ...current, agencyName: event.target.value }))}
              required
            />
          )}
          <FormField
            label="Contact phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            required
          />
          <FormField
            as="textarea"
            label="Tell us about your property or agency"
            name="message"
            value={values.message}
            onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
            minLength={1}
            required
          />
          <Button type="submit" disabled={isSubmitting}>
            <FileText size={17} /> {isSubmitting ? 'Submitting…' : 'Submit application'} <ArrowRight size={16} />
          </Button>
        </form>
      </div>
      {applications.length > 0 && <ApplicationHistory applications={applications} />}
      <Link to="/profile" className="account-page__back-link">Back to profile</Link>
    </div>
  )
}

function ApplicationHistory({ applications }) {
  return (
    <details className="admin-history">
      <summary>Application history ({applications.length})</summary>
      <div className="admin-history__list">
        {applications.map((item) => (
          <article className="admin-history__item" key={item.id}>
            <div>
              <strong>{item.sellerType === 'agent' ? item.agencyName || 'Agent application' : 'Owner application'}</strong>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              {item.rejectionReason && <p>{item.rejectionReason}</p>}
            </div>
            <Badge status={item.status} />
          </article>
        ))}
      </div>
    </details>
  )
}
