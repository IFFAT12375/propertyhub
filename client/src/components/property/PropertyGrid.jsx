import EmptyState from '../common/EmptyState.jsx'
import PropertyCard from './PropertyCard.jsx'

export default function PropertyGrid({
  properties,
  favoriteIds = [],
  onFavoriteToggle,
  emptyTitle,
}) {
  if (properties.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No properties found'}
        description="Try adjusting your search or filters to see more places."
      />
    )
  }

  return (
    <div className="property-grid">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={favoriteIds.includes(property.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
