import { Link, Route, Routes } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Favorites from '../pages/Favorites.jsx'
import MyInquiries from '../pages/MyInquiries.jsx'
import Profile from '../pages/Profile.jsx'
import Properties from '../pages/Properties.jsx'
import PropertyDetails from '../pages/PropertyDetails.jsx'
import Register from '../pages/Register.jsx'
import SellerApplication from '../pages/SellerApplication.jsx'
import SellerDashboard from '../pages/SellerDashboard.jsx'
import SellerInquiries from '../pages/SellerInquiries.jsx'
import SellerProperties from '../pages/SellerProperties.jsx'
import SellerPropertyForm from '../pages/SellerPropertyForm.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import AdminSellerApplications from '../pages/AdminSellerApplications.jsx'
import AdminProperties from '../pages/AdminProperties.jsx'
import AdminUsers from '../pages/AdminUsers.jsx'

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
      <Route
        path="/profile"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />
      <Route
        path="/favorites"
        element={<ProtectedRoute><Favorites /></ProtectedRoute>}
      />
      <Route
        path="/inquiries"
        element={<ProtectedRoute><MyInquiries /></ProtectedRoute>}
      />
      <Route
        path="/seller/apply"
        element={
          <ProtectedRoute allowedRoles={['user', 'seller']}>
            <SellerApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/application"
        element={
          <ProtectedRoute allowedRoles={['user', 'seller']}>
            <SellerApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/properties"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/properties/new"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerPropertyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/properties/:propertyId/edit"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerPropertyForm mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/inquiries"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seller-applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSellerApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}