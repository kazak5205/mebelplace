import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  name?: string
  username?: string
  email: string
  phone?: string | null
  role: string
  region?: string | null
  avatar?: string | null
  is_verified?: boolean
  points?: number
  level?: number
  created_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
    },
    loginFailure: (state) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions
export default authSlice.reducer
