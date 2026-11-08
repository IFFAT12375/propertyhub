import './App.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/property.css'
import { mockProperties } from './data/mockProperties.js'
import { getPublicProperties } from './utils/properties.js'
import Button from './components/common/Button.jsx'
import SectionHeading from './components/common/SectionHeading.jsx'
import SearchBar from './components/common/SearchBar.jsx'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'
import PropertyGrid from './components/property/PropertyGrid.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <section className="hero-section">
          <div className="page-container hero-section__content">
            <span className="eyebrow">A better way to find home</span>
            <h1>Find a place that feels like <em>yours.</em></h1>
            <p>Thoughtful homes and spaces, right here in Lahore.</p>
            <SearchBar />
          </div>
        </section>
        <section className="section page-container">
          <SectionHeading
            eyebrow="Handpicked for you"
            title="Places worth a closer look"
            description="Explore a selection of available homes and commercial spaces around Lahore."
            action={
              <Button as="link" to="/properties" variant="outline">
                Browse all
              </Button>
            }
          />
          <PropertyGrid
            properties={getPublicProperties(mockProperties).slice(0, 3)}
          />
        </section>
      </main>
      <Footer />
    </div>
  )
}
