import { useState } from 'react'
import { ArrowRight, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useRegisterMutation } from '../services/api/authApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [register, { isLoading }] = useRegisterMutation()
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (new TextEncoder().encode(values.password).length > 72) {
      setError('Password must be no more than 72 bytes.')
      return
    }
    if (values.password !== values.confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }).unwrap()
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    }
  }

  return (
    <div className="auth-page page-container">
      <section className="auth-card">
        <div className="auth-card__icon"><UserPlus size={22} /></div>
        <SectionHeading
          align="center"
          eyebrow="Get started"
          title="Create your account"
          description="Save homes you love and stay in control of your search."
        />
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            label="Full name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            minLength={2}
            required
          />
          <FormField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            required
          />
          <FormField
            label="Phone number"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            placeholder="+92 3XX XXXXXXX"
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            minLength={8}
            required
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />
          <Button type="submit" className="auth-form__submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'} <ArrowRight size={17} />
          </Button>
        </form>
        <p className="auth-card__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </div>
  )
}
