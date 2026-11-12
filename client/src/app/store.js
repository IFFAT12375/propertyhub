import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../services/api/baseApi.js'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
