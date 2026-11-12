import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import PropertyGrid from '../components/property/PropertyGrid.jsx'
import useFavoriteActions from '../hooks/useFavoriteActions.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function Favorites() {
  const [page, setPage] = useState(1)
  const { favoriteIds, error: favoriteError, toggleFavorite, data, isLoading, isFetching, queryError, refetch } =
    useFavoriteActions({ page, limit: 20 })
  const savedProperties = (data?.favorites || []).map(({ property }) => property)

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Your shortlist"
        title="Saved properties"
        description="Keep the homes and spaces you’re considering close at hand."
      />
      {isLoading ? (
        <p role="status">Loading your saved properties…</p>
      ) : queryError ? (
        <EmptyState
          title="Saved properties could not be loaded"
          description={apiErrorMessage(queryError)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : savedProperties.length ? (
        <PropertyGrid
          properties={savedProperties}
          favoriteIds={favoriteIds}
          onFavoriteToggle={(propertyId) => void toggleFavorite(propertyId)}
        />
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Save a property from a listing card or its detail page to see it here."
          action={<Button as="link" to="/properties">Explore properties</Button>}
        />
      )}
      {favoriteError && <p className="form-alert" role="alert">{favoriteError}</p>}
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
      {data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="Favorite property pages">
          <Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
      <Link className="account-page__back-link" to="/profile">
        Back to profile
      </Link>
    </div>
  )
}
