import { baseApi } from './baseApi.js'
import { clearSession, setSession, setUser } from '../../features/auth/authSlice.js'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
      transformResponse: (response) => response.data.user,
    }),
    login: builder.mutation({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      transformResponse: (response) => response.data,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setSession(data))
        } catch {
          // The calling form displays the server error.
        }
      },
    }),
    refreshSession: builder.mutation({
      query: () => ({ url: 'auth/refresh', method: 'POST' }),
      transformResponse: (response) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setSession(data))
        } catch {
          dispatch(clearSession())
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          // Local logout must complete even when the server is unreachable.
        } finally {
          dispatch(clearSession())
          dispatch(baseApi.util.resetApiState())
        }
      },
    }),
    getCurrentUser: builder.query({
      query: () => 'users/me',
      transformResponse: (response) => response.data.user,
      providesTags: ['CurrentUser'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          // The session bootstrapper handles authentication failures.
        }
      },
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: 'users/me', method: 'PATCH', body }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['CurrentUser', { type: 'Properties', id: 'PUBLIC' }, { type: 'Properties', id: 'SELLER' }],
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          // The profile form displays the server error.
        }
      },
    }),
  }),
})

export const {
  useLazyGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} = authApi
