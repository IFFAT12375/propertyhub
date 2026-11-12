import { baseApi } from './baseApi.js'
import { normalizeProperty } from './normalizers.js'

function withoutEmptyValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
  )
}

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params = {}) => ({
        url: 'properties',
        params: withoutEmptyValues(params),
      }),
      transformResponse: (response) => ({
        ...response.data,
        properties: response.data.properties.map(normalizeProperty),
      }),
      providesTags: (result) => [
        { type: 'Properties', id: 'PUBLIC' },
        ...(result?.properties || []).map(({ id }) => ({ type: 'Properties', id })),
      ],
    }),
    getProperty: builder.query({
      query: (id) => `properties/${id}`,
      transformResponse: (response) => normalizeProperty(response.data.property),
      providesTags: (_result, _error, id) => [{ type: 'Properties', id }],
    }),
    getSellerProperties: builder.query({
      query: (params = {}) => ({
        url: 'properties/mine',
        params: withoutEmptyValues(params),
      }),
      transformResponse: (response) => ({
        ...response.data,
        properties: response.data.properties.map(normalizeProperty),
      }),
      providesTags: (result) => [
        { type: 'Properties', id: 'SELLER' },
        ...(result?.properties || []).map(({ id }) => ({ type: 'Properties', id })),
      ],
    }),
    getSellerProperty: builder.query({
      query: (id) => `properties/mine/${id}`,
      transformResponse: (response) => normalizeProperty(response.data.property),
      providesTags: (_result, _error, id) => [{ type: 'Properties', id }],
    }),
    createProperty: builder.mutation({
      query: (body) => ({ url: 'properties', method: 'POST', body }),
      transformResponse: (response) => normalizeProperty(response.data.property),
      invalidatesTags: [{ type: 'Properties', id: 'SELLER' }, { type: 'Properties', id: 'PUBLIC' }],
    }),
    updateProperty: builder.mutation({
      query: ({ id, body }) => ({ url: `properties/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => normalizeProperty(response.data.property),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Properties', id },
        { type: 'Properties', id: 'SELLER' },
        { type: 'Properties', id: 'PUBLIC' },
      ],
    }),
    updateAvailability: builder.mutation({
      query: ({ id, availabilityStatus }) => ({
        url: `properties/${id}/availability`,
        method: 'PATCH',
        body: { availabilityStatus },
      }),
      transformResponse: (response) => normalizeProperty(response.data.property),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Properties', id },
        { type: 'Properties', id: 'SELLER' },
        { type: 'Properties', id: 'PUBLIC' },
      ],
    }),
    deletePropertyImage: builder.mutation({
      query: ({ id, filename }) => ({
        url: `properties/${id}/images/${encodeURIComponent(filename)}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => normalizeProperty(response.data.property),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Properties', id }, { type: 'Properties', id: 'SELLER' }],
    }),
    archiveProperty: builder.mutation({
      query: (id) => ({ url: `properties/${id}`, method: 'DELETE' }),
      transformResponse: (response) => normalizeProperty(response.data.property),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Properties', id },
        { type: 'Properties', id: 'SELLER' },
        { type: 'Properties', id: 'PUBLIC' },
      ],
    }),
  }),
})

export const {
  useArchivePropertyMutation,
  useCreatePropertyMutation,
  useDeletePropertyImageMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetSellerPropertiesQuery,
  useGetSellerPropertyQuery,
  useUpdateAvailabilityMutation,
  useUpdatePropertyMutation,
} = propertiesApi
