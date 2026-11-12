import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useLoginMutation } from '../services/api/authApi.js'
import { setSession } from '../features/auth/authSlice.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

function getDefaultRoute(user) {
  if (user.role === 'admin') return '/admin'
  if (user.role === 'seller') return '/seller'
  return '/profile'
}

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const initialized = useSelector((state) => state.auth.initialized)
  const [login, { isLoading }] = useLoginMutation()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const session = await login(values).unwrap()
      dispatch(setSession(session))
      const { user } = session
      const requestedPath = searchParams.get('redirect')
      const safePath =
        requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : location.state?.from?.pathname || getDefaultRoute(user)
      navigate(safePath, { replace: true })
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    }
  }

  const registered = location.state?.registered === true

  return (
    <div className="auth-page page-container">
      <section className="auth-card">
        <div className="auth-card__icon"><UserRound size={22} /></div>
        <SectionHeading
          align="center"
          eyebrow="Welcome back"
          title="Log in to PropertyHub"
          description="Sign in to manage your saved places and property activity."
        />
        {registered && (
          <div className="success-message" role="status">
            Your account was created. Log in to continue.
          </div>
        )}
        {!initialized && (
          <p role="status">Checking for an existing session…</p>
        )}
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
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
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="auth-form__submit" disabled={isLoading || !initialized}>
            {isLoading ? 'Logging in…' : 'Log in'} <ArrowRight size={17} />
          </Button>
        </form>
        <p className="auth-card__switch">
          New to PropertyHub? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  )
}
