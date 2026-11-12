import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import fallbackImage from '../assets/property-placeholder.svg'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import PropertyGrid from '../components/property/PropertyGrid.jsx'
import { useGetPropertiesQuery } from '../services/api/propertiesApi.js'
import useFavoriteActions from '../hooks/useFavoriteActions.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

const areas = ['Gulberg', 'DHA Phase 6', 'Johar Town', 'Lahore Cantt', 'Bahria Town']

export default function Home() {
  const user = useSelector((state) => state.auth.user)
  const {
    favoriteIds,
    error: favoriteError,
    queryError: favoriteQueryError,
    toggleFavorite,
  } = useFavoriteActions()
  const { data, error, isLoading, refetch } = useGetPropertiesQuery({ page: 1, limit: 3 })
  const navigate = useNavigate()
  const featuredProperties = data?.properties || []

  function handleFavoriteToggle(propertyId) {
    if (!user) {
      navigate('/login?redirect=%2Ffavorites')
      return
    }
    void toggleFavorite(propertyId)
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="page-container home-hero__grid">
          <div className="home-hero__copy">
            <span className="eyebrow">A better way to find home</span>
            <h1>Find a place that feels like <em>yours.</em></h1>
            <p>
              Thoughtful homes and spaces, clear details, and a more considered way
              to search Lahore.
            </p>
            <SearchBar />
            <div className="home-hero__trust">
              <span><ShieldCheck size={17} /> Reviewed listings</span>
              <span><MapPin size={17} /> Lahore focused</span>
            </div>
          </div>
          <div className="home-hero__image-wrap">
            <img
              src={featuredProperties[0]?.image || fallbackImage}
              alt="A welcoming modern home"
              onError={(event) => {
                event.currentTarget.src = fallbackImage
              }}
            />
            <div className="home-hero__image-note">
              <span className="home-hero__note-icon"><BadgeCheck size={18} /></span>
              <span>
                <strong>Know what you’re viewing</strong>
                <small>Clear listing and availability status</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-areas section page-container">
        <SectionHeading
          eyebrow="Explore Lahore"
          title="Start with a neighbourhood"
          description="Search homes and spaces in the parts of the city you know."
        />
        <div className="home-areas__list">
          {areas.map((area) => (
            <Link
              className="area-chip"
              key={area}
              to={`/properties?location=${encodeURIComponent(area)}`}
            >
              <MapPin size={16} aria-hidden="true" />
              {area}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-featured section page-container">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Places worth a closer look"
          description="Explore available homes and commercial spaces. Listings awaiting review or no longer available stay out of public search."
          action={
            <Button as="link" to="/properties" variant="outline">
              Browse all <ArrowRight size={16} />
            </Button>
          }
        />
        {isLoading ? (
          <p role="status">Loading featured properties…</p>
        ) : !error ? (
          <PropertyGrid
            properties={featuredProperties}
            favoriteIds={favoriteIds}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ) : null}
        {error && (
          <EmptyState
            title="Featured properties could not be loaded"
            description={apiErrorMessage(error)}
            action={<Button variant="outline" onClick={refetch}>Try again</Button>}
          />
        )}
        {favoriteError && <p className="form-alert" role="alert">{favoriteError}</p>}
        {favoriteQueryError && (
          <p className="form-alert" role="alert">
            Saved property status unavailable: {apiErrorMessage(favoriteQueryError)}
          </p>
        )}
      </section>

      <section className="home-seller">
        <div className="page-container home-seller__inner">
          <div>
            <span className="eyebrow">For property owners and agents</span>
            <h2>Have a place to share?</h2>
            <p>Apply for seller access and manage your listings in one place.</p>
          </div>
          <Button as="link" to="/seller/apply" variant="light">
            Learn about listing <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </div>
  )
}