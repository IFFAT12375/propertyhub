import './App.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/property.css'
import './styles/pages.css'
import './styles/dashboard.css'
import './styles/admin.css'
import AppRoutes from './routes/AppRoutes.jsx'
import Footer from './components/layout/Footer.jsx'
import Navbar from './components/layout/Navbar.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main id="main-content"><AppRoutes /></main>
      <Footer />
    </div>
  )
}
