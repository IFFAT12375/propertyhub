import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { clearSession, setSession } from '../../features/auth/authSlice.js'

const baseUrl = `${(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
).replace(/\/+$/, '')}/`

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders(headers, { getState }) {
    const accessToken = getState().auth.accessToken
    if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
    return headers
  },
})

let refreshRequest

async function baseQueryWithReauth(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions)
  const skipRefresh = ['login', 'register', 'refreshSession', 'logout'].includes(api.endpoint)
  if (result.error?.status !== 401 || skipRefresh || !api.getState().auth.accessToken) {
    return result
  }

  if (!refreshRequest) {
    refreshRequest = rawBaseQuery({ url: 'auth/refresh', method: 'POST' }, api, extraOptions)
  }
  const activeRefreshRequest = refreshRequest
  const refreshResult = await activeRefreshRequest
  if (refreshRequest === activeRefreshRequest) refreshRequest = null

  const session = refreshResult.data?.data
  if (session?.accessToken && session.user) {
    api.dispatch(setSession(session))
    return rawBaseQuery(args, api, extraOptions)
  }

  api.dispatch(clearSession())
  api.dispatch(baseApi.util.resetApiState())
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'AdminApplications',
    'AdminProperties',
    'AdminUsers',
    'Applications',
    'CurrentUser',
    'Favorites',
    'MyInquiries',
    'Properties',
    'SellerInquiries',
  ],
  endpoints: () => ({}),
})
