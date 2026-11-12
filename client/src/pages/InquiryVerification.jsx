import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useVerifyInquiryQuery } from '../services/api/inquiriesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function InquiryVerification() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { data, error, isLoading, refetch } = useVerifyInquiryQuery(token, { skip: !token })
  const errorCode = error?.data?.error?.code

  return (
    <div className="auth-page page-container">
      <section className="auth-card">
        <SectionHeading
          align="center"
          eyebrow="Inquiry verification"
          title={isLoading ? 'Verifying your email…' : data ? 'Email verified' : 'Verification unavailable'}
          description={
            isLoading
              ? 'We are confirming the inquiry email address.'
              : data?.verificationStatus === 'verified'
                ? 'Your inquiry has been shared with the property seller.'
                : !token
                  ? 'The verification link is missing its token.'
                : errorCode === 'INQUIRY_VERIFICATION_EXPIRED'
                  ? 'This verification link has expired. Submit a new inquiry to receive another link.'
                  : errorCode === 'INVALID_INQUIRY_VERIFICATION'
                    ? 'This verification link is invalid or has already been used.'
                    : error
                      ? apiErrorMessage(error)
                      : 'The verification link could not be checked.'
          }
        />
        {error && errorCode !== 'INQUIRY_VERIFICATION_EXPIRED' && errorCode !== 'INVALID_INQUIRY_VERIFICATION' && (
          <div className="form-alert" role="alert">{apiErrorMessage(error)}</div>
        )}
        {error && (
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            Try verification again
          </Button>
        )}
        <p className="auth-card__switch">
          <Link to="/properties">Browse properties</Link>
        </p>
      </section>
    </div>
  )
}
