import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLazyGetCurrentUserQuery, useRefreshSessionMutation } from '../../services/api/authApi.js'
import { setInitialized } from './authSlice.js'

let restorationPromise

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch()
  const [refreshSession] = useRefreshSessionMutation()
  const [getCurrentUser] = useLazyGetCurrentUserQuery()

  useEffect(() => {
    if (!restorationPromise) {
      restorationPromise = (async () => {
        try {
          await refreshSession().unwrap()
          await getCurrentUser().unwrap()
        } catch {
          // A missing or expired refresh cookie means this is a guest session.
        } finally {
          dispatch(setInitialized())
        }
      })()
    }
  }, [dispatch, getCurrentUser, refreshSession])

  return children
}
