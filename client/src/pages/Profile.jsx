import { useState } from 'react'
import { ArrowRight, Heart, MessageSquare, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { applications, updateSellerContact } = useMarketplace()
  const application = applications.find((item) => item.userId === user.id)
  const [values, setValues] = useState({
    name: user.name,
    phone: user.phone || '',
  })
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    updateProfile(values)
    updateSellerContact(user.id, values)
    setMessage('Your profile was updated in this demo session.')
  }

  return (
    <div className="account-page page-container">
      <SectionHeading
        eyebrow="Your account"
        title="Profile"
        description="Manage the details associated with your PropertyHub demo account."
      />
      <div className="account-grid">
        <section className="account-panel">
          <h2><UserRound size={19} /> Personal details</h2>
          <p className="account-panel__note">
            These changes are kept in the current browser session only.
          </p>
          {message && <div className="success-message" role="status">{message}</div>}
          <form className="account-form" onSubmit={handleSubmit}>
            <FormField
              label="Full name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
            <FormField
              label="Email address"
              name="email"
              type="email"
              value={user.email}
              disabled
            />
            <FormField
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) =>
                setValues((current) => ({ ...current, phone: event.target.value }))
              }
              required
            />
            <Button type="submit">Save changes</Button>
          </form>
        </section>

        <section className="account-panel account-shortcuts">
          <h2>Your PropertyHub</h2>
          <Link to="/favorites">
            <Heart size={18} /> Saved properties <ArrowRight size={16} />
          </Link>
          <Link to="/inquiries">
            <MessageSquare size={18} /> My inquiries <ArrowRight size={16} />
          </Link>
          {user.role === 'seller' ? (
            <Link to="/seller">
              <UserRound size={18} /> Seller workspace <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to={application ? '/seller/application' : '/seller/apply'}>
              <UserRound size={18} />
              {application ? 'Seller application status' : 'Apply for seller access'}
              <ArrowRight size={16} />
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
