import { useState } from 'react'
import { ArrowRight, KeyRound, UserRound } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/common/Button.jsx'
import FormField from '../components/common/FormField.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { demoUsers } from '../data/mockUsers.js'
import { useAuth } from '../context/useAuth.js'

const demoLabels = {
  user: 'Seeker',
  seller: 'Approved seller',
  admin: 'Administrator',
}

function getDefaultRoute(user) {
  if (user.role === 'admin') return '/admin'
  if (user.role === 'seller') return '/seller'
  return '/profile'
}

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = login(values.email, values.password)
    if (!result.success) {
      setError(result.message)
      return
    }

    const requestedPath = searchParams.get('redirect')
    const safePath =
      requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : getDefaultRoute(result.user)
    navigate(safePath, { replace: true })
  }

  function selectDemoAccount(account) {
    setValues({ email: account.email, password: account.password })
    setError('')
  }

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
        <div className="prototype-notice">
          Prototype login only. No account is created on a server. Use a demo
          account below with password <strong>demo123</strong>.
        </div>
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
          <Button type="submit" className="auth-form__submit">
            Log in <ArrowRight size={17} />
          </Button>
        </form>
        <div className="demo-accounts">
          <h2><KeyRound size={16} /> Explore a demo role</h2>
          {demoUsers.map((account) => (
            <button
              className="demo-account"
              type="button"
              key={account.id}
              onClick={() => selectDemoAccount(account)}
            >
              <span>
                <strong>{demoLabels[account.role]}</strong>
                <small>{account.email}</small>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
        <p className="auth-card__switch">
          New to PropertyHub? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  )
}
