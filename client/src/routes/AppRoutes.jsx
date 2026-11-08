import { Link, Route, Routes } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Properties from '../pages/Properties.jsx'
import PropertyDetails from '../pages/PropertyDetails.jsx'
import Register from '../pages/Register.jsx'

function NotFound() {
  return (
    <section className="not-found page-container">
      <span className="eyebrow">404 · Page not found</span>
      <h1>We couldn’t find that page.</h1>
      <p>The address may have changed, or the page may no longer be available.</p>
      <Button as="link" to="/">Return to PropertyHub</Button>
      <Link to="/properties">Browse listings</Link>
    </section>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:propertyId" element={<PropertyDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}