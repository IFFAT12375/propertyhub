import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import PropertyGrid from '../components/property/PropertyGrid.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

export default function Favorites() {
  const { favoriteIds, toggleFavorite } = useAuth()
  const { properties } = useMarketplace()
  const savedProperties = properties.filter((property) =>
    favoriteIds.includes(property.id),
  )

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Your shortlist"
        title="Saved properties"
        description="Keep the homes and spaces you’re considering close at hand."
      />
      {savedProperties.length ? (
        <PropertyGrid
          properties={savedProperties}
          favoriteIds={favoriteIds}
          onFavoriteToggle={toggleFavorite}
        />
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Save a property from a listing card or its detail page to see it here."
          action={<Button as="link" to="/properties">Explore properties</Button>}
        />
      )}
      {savedProperties.some(
        (property) =>
          property.moderationStatus !== 'approved' ||
          property.availabilityStatus !== 'available' ||
          property.recordStatus !== 'active',
      ) && (
        <p className="account-page__notice">
          Some saved properties are no longer publicly available. Their records
          remain here so you can remove them from your shortlist.
        </p>
      )}
      <Link className="account-page__back-link" to="/profile">
        Back to profile
      </Link>
    </div>
  )
}
