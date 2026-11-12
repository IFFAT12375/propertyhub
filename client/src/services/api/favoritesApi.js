import { baseApi } from './baseApi.js'
import { normalizeProperty } from './normalizers.js'

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: (params = {}) => ({
        url: 'favorites',
        params: { page: 1, limit: 100, ...params },
      }),
      transformResponse: (response) => ({
        ...response.data,
        favorites: response.data.favorites.map((favorite) => ({
          ...favorite,
          id: favorite.id || String(favorite._id),
          property: normalizeProperty(favorite.property),
        })),
      }),
      providesTags: (result) => [
        { type: 'Favorites', id: 'LIST' },
        ...(result?.favorites || []).map(({ property }) => ({
          type: 'Favorites',
          id: property.id,
        })),
      ],
    }),
    addFavorite: builder.mutation({
      query: (propertyId) => ({
        url: 'favorites',
        method: 'POST',
        body: { propertyId },
      }),
      invalidatesTags: (_result, _error, propertyId) => [
        { type: 'Favorites', id: 'LIST' },
        { type: 'Favorites', id: propertyId },
      ],
    }),
    removeFavorite: builder.mutation({
      query: (propertyId) => ({
        url: `favorites/${propertyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, propertyId) => [
        { type: 'Favorites', id: 'LIST' },
        { type: 'Favorites', id: propertyId },
      ],
    }),
  }),
})

export const {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} = favoritesApi
