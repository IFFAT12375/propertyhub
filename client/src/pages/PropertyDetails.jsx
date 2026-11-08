import { useState } from 'react'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle2,
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
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'
import { formatPrice, getPublicProperties } from '../utils/properties.js'

export default function PropertyDetails() {
  const { propertyId } = useParams()
  const { properties } = useMarketplace()
  const property = getPublicProperties(properties).find(
    (item) => item.id === propertyId,
  )

  if (!property) {
    return (
      <div className="page-container section">
        <EmptyState
          title="This property isn’t available"
          description="It may have been removed or is no longer available to view."
          action={<Button as="link" to="/properties">Browse properties</Button>}
        />
      </div>
    )
  }

  return <PropertyDetailsContent key={property.id} property={property} />
}

function PropertyDetailsContent({ property }) {
  const { user, favoriteIds, toggleFavorite } = useAuth()
  const { createInquiry } = useMarketplace()
  const navigate = useNavigate()
  const [imageSource, setImageSource] = useState(property.image || fallbackImage)
  const [inquiry, setInquiry] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
  })
  const [submission, setSubmission] = useState(null)
  const isFavorite = favoriteIds.includes(property.id)

  function handleFavorite() {
    if (!user) {
      navigate('/login?redirect=%2Ffavorites')
      return
    }
    toggleFavorite(property.id)
  }

  function submitInquiry(event) {
    event.preventDefault()
    const result = createInquiry({
      propertyId: property.id,
      seekerId: user?.id || null,
      name: inquiry.name,
      email: inquiry.email,
      phone: user?.phone || '',
      message: inquiry.message,
    })
    if (!result.success) {
      setSubmission({ status: 'error', message: result.message })
      return
    }
    setSubmission({
      status: result.inquiry.verificationStatus,
      message: user
        ? 'Your demo inquiry is now visible in My inquiries. It has not been sent to a real seller.'
        : 'Demo inquiry saved as awaiting email verification. No email was sent, and sellers cannot see it as verified.',
    })
    setInquiry((current) => ({ ...current, message: '' }))
  }

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
          <h1>{property.title}</h1>
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
          alt={property.title}
          onError={() => setImageSource(fallbackImage)}
        />
        <div className="property-details__gallery-overlay">
          <span>Property photos</span>
          <Button
            variant="light"
            size="small"
            onClick={handleFavorite}
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
            <div className="inquiry-demo-note">
              <CheckCircle2 size={17} />
              <span>
                Prototype only: messages are not delivered. Guest inquiries are
                represented as unverified until email verification exists.
              </span>
            </div>
            {submission && (
              <div
                className={`inquiry-feedback inquiry-feedback--${submission.status}`}
                role="status"
              >
                {submission.message}
              </div>
            )}
            <form className="inquiry-form" id="inquiry-form" onSubmit={submitInquiry}>
              <div className="inquiry-form__row">
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
              </div>
              <FormField
                as="textarea"
                label="Message"
                name="message"
                value={inquiry.message}
                onChange={(event) =>
                  setInquiry((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="I’d like to know more about this property..."
                minLength={10}
                required
              />
              <Button type="submit">Send demo inquiry</Button>
            </form>
          </section>
        </div>

        <aside className="seller-card">
          <div className="seller-card__avatar" aria-hidden="true">
            {property.seller.name.charAt(0)}
          </div>
          <span className="eyebrow">Listed by</span>
          <h2>{property.seller.name}</h2>
          <p>PropertyHub seller</p>
          {property.seller.phoneVisible ? (
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