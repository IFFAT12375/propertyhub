import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  accessToken: null,
  user: null,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
    },
    setUser(state, action) {
      state.user = action.payload
    },
    clearSession(state) {
      state.accessToken = null
      state.user = null
    },
    setInitialized(state) {
      state.initialized = true
    },
  },
})

export const {
  clearSession,
  setInitialized,
  setSession,
  setUser,
} = authSlice.actions

export default authSlice.reducer
