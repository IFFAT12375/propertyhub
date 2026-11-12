import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from '../services/api/favoritesApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

export default function useFavoriteActions(params = { page: 1, limit: 100 }) {
  const user = useSelector((state) => state.auth.user)
  const { data, isLoading, isFetching, error: queryError, refetch } =
    useGetFavoritesQuery(params, { skip: !user })
  const [addFavorite] = useAddFavoriteMutation()
  const [removeFavorite] = useRemoveFavoriteMutation()
  const [pendingId, setPendingId] = useState(null)
  const [error, setError] = useState('')
  const favoriteIds = (data?.favorites || []).map(({ property }) => property.id)

  async function toggleFavorite(propertyId) {
    if (!user || pendingId) return false
    setPendingId(propertyId)
    setError('')
    try {
      if (favoriteIds.includes(propertyId)) {
        await removeFavorite(propertyId).unwrap()
      } else {
        await addFavorite(propertyId).unwrap()
      }
      return true
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
      return false
    } finally {
      setPendingId(null)
    }
  }

  return { favoriteIds, pendingId, error, toggleFavorite, data, isLoading, isFetching, queryError, refetch }
}
