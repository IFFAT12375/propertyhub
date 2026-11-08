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
  const users = useMemo(() => accounts.map(publicUser), [accounts])
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
      if (account.status === 'suspended') {
        return { success: false, message: 'This demo account is currently suspended.' }
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
        status: 'active',
      }
      setAccounts((current) => [...current, account])
      const registeredUser = publicUser(account)
      setUser(registeredUser)
      return { success: true, user: registeredUser }
    },
    [accounts],
  )

  const logout = useCallback(() => setUser(null), [])

  const updateProfile = useCallback(
    (updates) => {
      if (!user) return false
      const nextUser = {
        ...user,
        name: updates.name.trim(),
        phone: updates.phone.trim(),
      }
      setUser(nextUser)
      setAccounts((current) =>
        current.map((account) =>
          account.id === user.id ? { ...account, ...updates } : account,
        ),
      )
      return true
    },
    [user],
  )

  const updateUserAccount = useCallback(
    (userId, updates) => {
      const account = accounts.find((item) => item.id === userId)
      if (!account) return false

      const nextAccount = { ...account, ...updates }
      setAccounts((current) =>
        current.map((item) => (item.id === userId ? nextAccount : item)),
      )
      if (user?.id === userId) setUser(publicUser(nextAccount))
      return true
    },
    [accounts, user],
  )

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
    () => ({
      user,
      users,
      favoriteIds,
      login,
      register,
      logout,
      updateProfile,
      updateUserAccount,
      toggleFavorite,
    }),
    [
      user,
      users,
      favoriteIds,
      login,
      register,
      logout,
      updateProfile,
      updateUserAccount,
      toggleFavorite,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
