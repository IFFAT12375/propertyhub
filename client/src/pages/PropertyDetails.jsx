import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Phone,
  Ruler,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import fallbackImage from '../assets/property-placeholder.svg'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useGetPropertyQuery } from '../services/api/propertiesApi.js'
import { useCreateInquiryMutation } from '../services/api/inquiriesApi.js'
import useFavoriteActions from '../hooks/useFavoriteActions.js'
import { apiErrorMessage } from '../utils/apiErrors.js'
import { formatPrice } from '../utils/properties.js'

export default function PropertyDetails() {
  const { propertyId } = useParams()
  const { data: property, error, isLoading, refetch } = useGetPropertyQuery(propertyId)

  if (isLoading) {
    return <div className="page-container section" role="status">Loading property…</div>
  }
  if (!property) {
    return (
      <div className="page-container section">
        <EmptyState
          title="This property isn’t available"
          description={error ? apiErrorMessage(error, 'It may have been removed or is no longer available to view.') : 'It may have been removed or is no longer available to view.'}
          action={error
            ? <Button variant="outline" onClick={refetch}>Try again</Button>
            : <Button as="link" to="/properties">Browse properties</Button>}
        />
      </div>
    )
  }

  return <PropertyDetailsContent key={property.id} property={property} />
}

function PropertyDetailsContent({ property }) {
  const user = useSelector((state) => state.auth.user)
  const {
    favoriteIds,
    error: favoriteError,
    queryError: favoriteQueryError,
    toggleFavorite,
  } = useFavoriteActions()
  const [createInquiry, { isLoading: isSubmittingInquiry }] = useCreateInquiryMutation()
  const navigate = useNavigate()
  const [imageSource, setImageSource] = useState(property.images?.[0]?.url || property.image || fallbackImage)
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' })
  const [submission, setSubmission] = useState(null)
  const isFavorite = favoriteIds.includes(property.id)

  function handleFavorite() {
    if (!user) {
      navigate('/login?redirect=%2Ffavorites')
      return
    }
    void toggleFavorite(property.id)
  }

  async function submitInquiry(event) {
    event.preventDefault()
    try {
      const result = await createInquiry({
        propertyId: property.id,
        ...(!user ? { name: inquiry.name, email: inquiry.email } : {}),
        message: inquiry.message,
      }).unwrap()
      setSubmission({
        status: result.data.verificationStatus,
        message: result.message || 'Your inquiry has been sent to the property seller.',
      })
      setInquiry((current) => ({ ...current, message: '' }))
    } catch (requestError) {
      setSubmission({ status: 'error', message: apiErrorMessage(requestError) })
    }
  }

  const title = property.title || 'Property details'
  return (
    <div className="property-details page-container">
      <Link className="back-link" to="/properties">
        <ArrowLeft size={17} /> Back to listings
      </Link>
      <div className="property-details__heading">
        <div>
          <div className="property-details__eyebrows">
            <Badge>{property.category}</Badge>
            <Badge>{property.purpose === 'rent' ? 'For rent' : 'For sale'}</Badge>
            <Badge status={property.availabilityStatus} />
          </div>
          <h1>{title}</h1>
          <p><MapPin size={17} /> {property.location.area}, {property.location.city}</p>
        </div>
        <div className="property-details__price">
          <strong>{formatPrice(property.price, property.purpose, property.priceFrequency)}</strong>
          {property.purpose === 'rent' && <span>Rental price</span>}
        </div>
      </div>

      <div className="property-details__gallery">
        <img
          src={imageSource}
          alt={title}
          onError={() => setImageSource(fallbackImage)}
        />
        <div className="property-details__gallery-overlay">
          <span>Property photos</span>
          <Button
            variant="light"
            size="small"
            onClick={handleFavorite}
            aria-label={
              isFavorite
                ? `Remove ${title} from favorites`
                : `Add ${title} to favorites`
            }
            aria-pressed={isFavorite}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="property-details__layout">
        <div className="property-details__main">
          <section className="details-panel">
            <SectionHeading title="Property overview" />
            <div className="property-facts">
              {property.bedrooms != null && (
                <div><BedDouble size={20} /><span><strong>{property.bedrooms}</strong> bedrooms</span></div>
              )}
              {property.bathrooms != null && (
                <div><Bath size={20} /><span><strong>{property.bathrooms}</strong> bathrooms</span></div>
              )}
              <div><Ruler size={20} /><span><strong>{property.area} {property.areaUnit}</strong> area</span></div>
            </div>
            <h2>About this property</h2>
            <p className="property-details__description">{property.description}</p>
            <dl className="property-specs">
              <div><dt>Category</dt><dd>{property.category}</dd></div>
              <div><dt>Property type</dt><dd>{property.type}</dd></div>
              <div><dt>Purpose</dt><dd>{property.purpose === 'sale' ? 'For sale' : 'For rent'}</dd></div>
              <div><dt>Availability</dt><dd><Badge status={property.availabilityStatus} /></dd></div>
            </dl>
          </section>

          <section className="details-panel">
            <SectionHeading
              title="Ask about this property"
              description="Send a message to express interest or ask a question."
            />
            {favoriteError && <p className="form-alert" role="alert">{favoriteError}</p>}
            {favoriteQueryError && (
              <p className="form-alert" role="alert">
                Saved property status unavailable: {apiErrorMessage(favoriteQueryError)}
              </p>
            )}
            {user && (
              <p className="account-panel__note">
                Sending as {user.name} ({user.email}).
              </p>
            )}
            {submission && (
              <div
                className={`inquiry-feedback inquiry-feedback--${submission.status}`}
                role={submission.status === 'error' ? 'alert' : 'status'}
              >
                {submission.message}
              </div>
            )}
            <form className="inquiry-form" id="inquiry-form" onSubmit={submitInquiry}>
              {!user && <div className="inquiry-form__row">
                <FormField
                  label="Your name"
                  name="name"
                  autoComplete="name"
                  value={inquiry.name}
                  onChange={(event) =>
                    setInquiry((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={inquiry.email}
                  onChange={(event) =>
                    setInquiry((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>}
              <FormField
                as="textarea"
                label="Message"
                name="message"
                value={inquiry.message}
                onChange={(event) =>
                  setInquiry((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="I’d like to know more about this property..."
                minLength={1}
                required
              />
              <Button type="submit" disabled={isSubmittingInquiry}>
                {isSubmittingInquiry ? 'Sending…' : 'Send inquiry'}
              </Button>
            </form>
          </section>
        </div>

        <aside className="seller-card">
          <div className="seller-card__avatar" aria-hidden="true">
            {property.seller?.name?.charAt(0) || 'S'}
          </div>
          <span className="eyebrow">Listed by</span>
          <h2>{property.seller?.name || 'PropertyHub seller'}</h2>
          <p>PropertyHub seller</p>
          {property.phoneVisible && property.seller?.phone ? (
            <a className="seller-card__phone" href={`tel:${property.seller.phone}`}>
              <Phone size={17} /> {property.seller.phone}
            </a>
          ) : (
            <p className="seller-card__private">
              This seller has chosen not to show a public phone number.
            </p>
          )}
          <Button
            variant="outline"
            onClick={() =>
              document.getElementById('inquiry-form')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
            }
          >
            Send an inquiry
          </Button>
        </aside>
      </div>
    </div>
  )
}