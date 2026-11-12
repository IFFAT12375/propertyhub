import { baseApi } from './baseApi.js'
import { normalizeApplication } from './normalizers.js'

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query({
      query: (params = {}) => ({ url: 'seller-applications/mine', params }),
      transformResponse: (response) => ({
        ...response.data,
        applications: response.data.applications.map(normalizeApplication),
      }),
      providesTags: ['Applications'],
    }),
    submitSellerApplication: builder.mutation({
      query: (body) => ({ url: 'seller-applications', method: 'POST', body }),
      transformResponse: (response) => normalizeApplication(response.data.application),
      invalidatesTags: ['Applications'],
    }),
  }),
})

export const {
  useGetMyApplicationsQuery,
  useSubmitSellerApplicationMutation,
} = applicationsApi
