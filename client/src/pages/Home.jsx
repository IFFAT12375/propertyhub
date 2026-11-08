import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import fallbackImage from '../assets/property-placeholder.svg'
import Button from '../components/common/Button.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import PropertyGrid from '../components/property/PropertyGrid.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'
import { getPublicProperties } from '../utils/properties.js'

const areas = ['Gulberg', 'DHA Phase 6', 'Johar Town', 'Lahore Cantt', 'Bahria Town']

export default function Home() {
  const { user, favoriteIds, toggleFavorite } = useAuth()
  const { properties } = useMarketplace()
  const navigate = useNavigate()
  const featuredProperties = getPublicProperties(properties).slice(0, 3)

  function handleFavoriteToggle(propertyId) {
    if (!user) {
      navigate('/login?redirect=%2Ffavorites')
      return
    }
    toggleFavorite(propertyId)
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
        <PropertyGrid
          properties={featuredProperties}
          favoriteIds={favoriteIds}
          onFavoriteToggle={handleFavoriteToggle}
        />
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