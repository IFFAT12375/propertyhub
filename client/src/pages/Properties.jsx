import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import PropertyGrid from '../components/property/PropertyGrid.jsx'
import { lahoreAreas } from '../data/locations.js'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'
import { getPublicProperties } from '../utils/properties.js'

const pageSize = 6
const propertyTypes = ['apartment', 'house', 'office', 'plot', 'shop', 'warehouse']

function readFilters(params) {
  return {
    location: params.get('location') || '',
    purpose: params.get('purpose') || '',
    category: params.get('category') || '',
    type: params.get('type') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
  }
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const { user, favoriteIds, toggleFavorite } = useAuth()
  const { properties } = useMarketplace()
  const navigate = useNavigate()
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)

  const results = getPublicProperties(properties).filter((property) => {
    const locationMatches =
      !filters.location ||
      property.location.area.toLowerCase() === filters.location.toLowerCase()
    const purposeMatches = !filters.purpose || property.purpose === filters.purpose
    const categoryMatches = !filters.category || property.category === filters.category
    const typeMatches = !filters.type || property.type === filters.type
    const minMatches =
      !filters.minPrice || property.price >= Number(filters.minPrice)
    const maxMatches =
      !filters.maxPrice || property.price <= Number(filters.maxPrice)
    return (
      locationMatches &&
      purposeMatches &&
      categoryMatches &&
      typeMatches &&
      minMatches &&
      maxMatches
    )
  })

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageResults = results.slice((safePage - 1) * pageSize, safePage * pageSize)

  function applyFilters(nextFilters) {
    const params = new URLSearchParams()
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
  }

  function changePage(page) {
    const params = new URLSearchParams(searchParams)
    if (page > 1) params.set('page', String(page))
    else params.delete('page')
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFilters() {
    setSearchParams({})
  }

  function handleFavoriteToggle(propertyId) {
    if (!user) {
      navigate('/login?redirect=%2Ffavorites')
      return
    }
    toggleFavorite(propertyId)
  }

  return (
    <div className="listing-page page-container">
      <SectionHeading
        eyebrow="Property listings"
        title="Find your place in Lahore"
        description="Browse approved, available homes and commercial properties."
      />
      <div className="listing-page__layout">
        <aside className="filter-panel" aria-label="Property filters">
          <div className="filter-panel__heading">
            <h2><SlidersHorizontal size={18} /> Refine your search</h2>
            <button type="button" className="text-button" onClick={resetFilters}>
              Clear all
            </button>
          </div>
          <FilterForm
            key={searchParams.toString()}
            initialValues={filters}
            onApply={applyFilters}
          />
        </aside>

        <section className="listing-results" aria-live="polite">
          <div className="listing-results__summary">
            <p>
              <strong>{results.length}</strong>{' '}
              {results.length === 1 ? 'property' : 'properties'} found
            </p>
            {filters.purpose && (
              <span className="listing-results__purpose">
                {filters.purpose === 'rent' ? 'For rent' : 'For sale'}
              </span>
            )}
          </div>
          {filters.minPrice &&
            filters.maxPrice &&
            Number(filters.minPrice) > Number(filters.maxPrice) ? (
            <EmptyState
              title="Check your price range"
              description="The minimum price must be lower than the maximum price."
            />
          ) : (
            <>
              <PropertyGrid
                properties={pageResults}
                favoriteIds={favoriteIds}
                onFavoriteToggle={handleFavoriteToggle}
              />
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Property result pages">
                  <Button
                    variant="outline"
                    size="small"
                    disabled={safePage === 1}
                    onClick={() => changePage(safePage - 1)}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <span>Page {safePage} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={safePage === totalPages}
                    onClick={() => changePage(safePage + 1)}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterForm({ initialValues, onApply }) {
  const [filters, setFilters] = useState(initialValues)
  const invalidPriceRange =
    filters.minPrice &&
    filters.maxPrice &&
    Number(filters.minPrice) > Number(filters.maxPrice)

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onApply(filters)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        as="select"
        label="Area"
        name="location"
        value={filters.location}
        onChange={updateFilter}
        options={[
          { value: '', label: 'All Lahore areas' },
          ...lahoreAreas.map((area) => ({ value: area, label: area })),
        ]}
      />
      <FormField
        as="select"
        label="Purpose"
        name="purpose"
        value={filters.purpose}
        onChange={updateFilter}
        options={[
          { value: '', label: 'Sale or rent' },
          { value: 'sale', label: 'For sale' },
          { value: 'rent', label: 'For rent' },
        ]}
      />
      <FormField
        as="select"
        label="Category"
        name="category"
        value={filters.category}
        onChange={updateFilter}
        options={[
          { value: '', label: 'All categories' },
          { value: 'residential', label: 'Residential' },
          { value: 'commercial', label: 'Commercial' },
        ]}
      />
      <FormField
        as="select"
        label="Property type"
        name="type"
        value={filters.type}
        onChange={updateFilter}
        options={[
          { value: '', label: 'All property types' },
          ...propertyTypes.map((type) => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
          })),
        ]}
      />
      <div className="filter-panel__prices">
        <FormField
          label="Minimum price (PKR)"
          name="minPrice"
          type="number"
          min="0"
          inputMode="numeric"
          value={filters.minPrice}
          onChange={updateFilter}
          placeholder="No minimum"
        />
        <FormField
          label="Maximum price (PKR)"
          name="maxPrice"
          type="number"
          min="0"
          inputMode="numeric"
          value={filters.maxPrice}
          onChange={updateFilter}
          placeholder="No maximum"
        />
      </div>
      {invalidPriceRange && (
        <p className="form-field__error" role="alert">
          Minimum price must be less than maximum price.
        </p>
      )}
      <Button
        type="submit"
        className="filter-panel__submit"
        disabled={Boolean(invalidPriceRange)}
      >
        Apply filters
      </Button>
    </form>
  )
}