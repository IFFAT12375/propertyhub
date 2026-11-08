import { useCallback, useMemo, useState } from 'react'
import { demoUsers } from '../data/mockUsers.js'
import { AuthContext } from './authContext.js'

function publicUser(account) {
  const user = { ...account }
  delete user.password
  return user
}

export default function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(demoUsers)
  const [user, setUser] = useState(null)
  const [favoritesByUser, setFavoritesByUser] = useState({})
  const favoriteIds = useMemo(
    () => (user ? favoritesByUser[user.id] || [] : []),
    [user, favoritesByUser],
  )

  const login = useCallback(
    (email, password) => {
      const account = accounts.find(
        (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
      )

      if (!account || account.password !== password) {
        return { success: false, message: 'The email or password is incorrect.' }
      }

      const authenticatedUser = publicUser(account)
      setUser(authenticatedUser)
      return { success: true, user: authenticatedUser }
    },
    [accounts],
  )

  const register = useCallback(
    ({ name, email, password, phone }) => {
      const normalizedEmail = email.trim().toLowerCase()
      if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists.' }
      }

      const account = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone.trim(),
        role: 'user',
        sellerApplicationStatus: 'not-applied',
      }
      setAccounts((current) => [...current, account])
      const registeredUser = publicUser(account)
      setUser(registeredUser)
      return { success: true, user: registeredUser }
    },
    [accounts],
  )

  const logout = useCallback(() => setUser(null), [])

  const toggleFavorite = useCallback(
    (propertyId) => {
      if (!user) return false

      setFavoritesByUser((current) => {
        const userFavorites = current[user.id] || []
        const nextFavorites = userFavorites.includes(propertyId)
          ? userFavorites.filter((id) => id !== propertyId)
          : [...userFavorites, propertyId]
        return { ...current, [user.id]: nextFavorites }
      })
      return true
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, favoriteIds, login, register, logout, toggleFavorite }),
    [user, favoriteIds, login, register, logout, toggleFavorite],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
