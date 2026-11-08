import { useState } from 'react'
import { ArrowRight, BadgeCheck, Clock3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

const initialForm = {
  sellerType: 'owner',
  agencyName: '',
  phone: '',
  message: '',
}

export default function SellerApplication() {
  const { user } = useAuth()
  const { applications, submitApplication } = useMarketplace()
  const application = applications.find((item) => item.userId === user.id)
  const [values, setValues] = useState({
    ...initialForm,
    phone: user.phone || '',
    sellerType: application?.sellerType || 'owner',
    agencyName: application?.agencyName || '',
    message: application?.message || '',
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = submitApplication({
      userId: user.id,
      applicantName: user.name,
      email: user.email,
      phone: values.phone.trim(),
      sellerType: values.sellerType,
      agencyName: values.agencyName.trim(),
      message: values.message.trim(),
    })
    if (!result.success) {
      setError(result.message)
      return
    }
    setSubmitted(true)
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

  if (application?.status === 'pending' || submitted) {
    return (
      <div className="account-page page-container">
        <div className="application-status application-status--pending">
          <Clock3 size={26} />
          <Badge status="pending" />
          <h1>Application submitted</h1>
          <p>
            Your demo application is pending administrator review. This prototype
            does not send notifications.
          </p>
          <Link to="/seller/application">View application status</Link>
        </div>
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
          <p>
            Previous decision: {application.rejectionReason || 'Please review your details and resubmit.'}
          </p>
        </div>
      )}
      <div className="application-form-card">
        <div className="prototype-notice">
          These fields are a working prototype and do not finalize the open
          application-field decisions in the PRD.
        </div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form className="seller-application-form" onSubmit={handleSubmit}>
          <FormField
            as="select"
            label="I am a"
            name="sellerType"
            value={values.sellerType}
            onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          )}
          <FormField
            label="Contact phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            required
          />
          <FormField
            as="textarea"
            label="Tell us about your property or agency"
            name="message"
            value={values.message}
            onChange={handleChange}
            minLength={10}
            required
          />
          <Button type="submit">
            <FileText size={17} /> Submit application <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}
