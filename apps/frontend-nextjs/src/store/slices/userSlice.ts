import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  createdAt: string
  updatedAt: string
}

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchProfileStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchProfileSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.isLoading = false
      state.profile = action.payload
      state.error = null
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfile,
  clearError,
} = userSlice.actions

export default userSlice.reducer
