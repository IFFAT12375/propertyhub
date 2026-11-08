import { useState } from 'react'
import { ArrowUpRight, Bath, BedDouble, Heart, MapPin, Ruler } from 'lucide-react'
import { Link } from 'react-router-dom'
import fallbackImage from '../../assets/property-placeholder.svg'
import Badge from '../common/Badge.jsx'
import { formatPrice } from '../../utils/properties.js'

export default function PropertyCard({
  property,
  isFavorite = false,
  onFavoriteToggle,
}) {
  const [imageSource, setImageSource] = useState(property.image || fallbackImage)

  return (
    <article className="property-card">
      <div className="property-card__image-wrap">
        <Link
          className="property-card__image-link"
          to={`/properties/${property.id}`}
          aria-label={`View ${property.title}`}
          tabIndex={-1}
        >
          <img
            className="property-card__image"
            src={imageSource}
            alt={property.title}
            loading="lazy"
            onError={() => setImageSource(fallbackImage)}
          />
        </Link>
        <span className="property-card__purpose">
          {property.purpose === 'rent' ? 'For rent' : 'For sale'}
        </span>
        {onFavoriteToggle && (
          <button
            className={`property-card__favorite${isFavorite ? ' is-favorite' : ''}`}
            type="button"
            aria-label={
              isFavorite
                ? `Remove ${property.title} from favorites`
                : `Add ${property.title} to favorites`
            }
            aria-pressed={isFavorite}
            onClick={() => onFavoriteToggle(property.id)}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="property-card__body">
        <div className="property-card__type-row">
          <span>{property.category} · {property.type}</span>
          <Badge status={property.availabilityStatus} />
        </div>
        <Link className="property-card__title" to={`/properties/${property.id}`}>
          {property.title}
        </Link>
        <p className="property-card__location">
          <MapPin size={15} aria-hidden="true" />
          {property.location.area}, {property.location.city}
        </p>
        <div className="property-card__features">
          {property.bedrooms != null && (
            <span><BedDouble size={16} aria-hidden="true" />{property.bedrooms} beds</span>
          )}
          {property.bathrooms != null && (
            <span><Bath size={15} aria-hidden="true" />{property.bathrooms} baths</span>
          )}
          <span><Ruler size={15} aria-hidden="true" />{property.area} {property.areaUnit}</span>
        </div>
        <div className="property-card__footer">
          <strong>
            {formatPrice(property.price, property.purpose, property.priceFrequency)}
          </strong>
          <Link
            className="property-card__details"
            to={`/properties/${property.id}`}
            aria-label={`See details for ${property.title}`}
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  )
}