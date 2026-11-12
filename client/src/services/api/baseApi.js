import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
).replace(/\/+$/, '')

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders(headers, { getState }) {
      const accessToken = getState()?.auth?.accessToken
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
      return headers
    },
  }),
  tagTypes: [],
  endpoints: () => ({}),
})
