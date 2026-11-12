import { baseApi } from './baseApi.js'
import { normalizeApplication, normalizeProperty } from './normalizers.js'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSellerApplications: builder.query({
      query: (params = {}) => ({ url: 'admin/seller-applications', params }),
      transformResponse: (response) => ({
        ...response.data,
        applications: response.data.applications.map(normalizeApplication),
      }),
      providesTags: ['AdminApplications'],
    }),
    reviewSellerApplication: builder.mutation({
      query: ({ id, status, rejectionReason }) => ({
        url: `admin/seller-applications/${id}/review`,
        method: 'PATCH',
        body: { status, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
      invalidatesTags: ['AdminApplications', 'AdminUsers'],
    }),
    getAdminProperties: builder.query({
      query: (params = {}) => ({ url: 'admin/properties', params }),
      transformResponse: (response) => ({
        ...response.data,
        properties: response.data.properties.map(normalizeProperty),
      }),
      providesTags: ['AdminProperties'],
    }),
    reviewProperty: builder.mutation({
      query: ({ id, moderationStatus, rejectionReason }) => ({
        url: `admin/properties/${id}/review`,
        method: 'PATCH',
        body: { moderationStatus, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
      invalidatesTags: ['AdminProperties', { type: 'Properties', id: 'PUBLIC' }, { type: 'Properties', id: 'SELLER' }],
    }),
    getAdminUsers: builder.query({
      query: (params = {}) => ({ url: 'admin/users', params }),
      transformResponse: (response) => ({
        ...response.data,
        users: response.data.users.map((user) => ({
          ...user,
          id: user.id || String(user._id),
          status: user.accountStatus,
        })),
      }),
      providesTags: ['AdminUsers'],
    }),
    updateSellerStatus: builder.mutation({
      query: ({ id, accountStatus }) => ({
        url: `admin/users/${id}/status`,
        method: 'PATCH',
        body: { accountStatus },
      }),
      invalidatesTags: ['AdminUsers', { type: 'Properties', id: 'PUBLIC' }, { type: 'Properties', id: 'SELLER' }],
    }),
  }),
})

export const {
  useGetAdminPropertiesQuery,
  useGetAdminSellerApplicationsQuery,
  useGetAdminUsersQuery,
  useReviewPropertyMutation,
  useReviewSellerApplicationMutation,
  useUpdateSellerStatusMutation,
} = adminApi
