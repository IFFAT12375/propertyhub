import { baseApi } from './baseApi.js'
import { normalizeProperty } from './normalizers.js'

function normalizeInquiry(inquiry) {
  return {
    ...inquiry,
    id: inquiry.id || String(inquiry._id),
    property: inquiry.property ? normalizeProperty(inquiry.property) : inquiry.property,
  }
}

export const inquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInquiry: builder.mutation({
      query: (body) => ({ url: 'inquiries', method: 'POST', body }),
    }),
    verifyInquiry: builder.query({
      query: (token) => ({ url: 'inquiries/verify', params: { token } }),
      transformResponse: (response) => response.data,
    }),
    getMyInquiries: builder.query({
      query: (params = {}) => ({ url: 'inquiries/mine', params }),
      transformResponse: (response) => ({
        ...response.data,
        inquiries: response.data.inquiries.map(normalizeInquiry),
      }),
      providesTags: ['MyInquiries'],
    }),
    getSellerInquiries: builder.query({
      query: (params = {}) => ({ url: 'inquiries', params }),
      transformResponse: (response) => ({
        ...response.data,
        inquiries: response.data.inquiries.map(normalizeInquiry),
      }),
      providesTags: ['SellerInquiries'],
    }),
    updateInquiryFollowUp: builder.mutation({
      query: ({ id, followUpStatus }) => ({
        url: `inquiries/${id}/follow-up`,
        method: 'PATCH',
        body: { followUpStatus },
      }),
      invalidatesTags: ['SellerInquiries'],
    }),
  }),
})

export const {
  useCreateInquiryMutation,
  useGetMyInquiriesQuery,
  useGetSellerInquiriesQuery,
  useUpdateInquiryFollowUpMutation,
  useVerifyInquiryQuery,
} = inquiriesApi
