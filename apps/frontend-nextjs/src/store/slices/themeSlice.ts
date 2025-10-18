import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark'
export type Language = 'ru' | 'en' | 'kk'

interface ThemeState {
  mode: ThemeMode
  language: Language
}

const initialState: ThemeState = {
  mode: 'dark', // Default to dark as per requirements
  language: 'ru', // Default to Russian
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
    },
    initializeFromStorage: (state, action: PayloadAction<{ theme?: ThemeMode; language?: Language }>) => {
      if (action.payload.theme) {
        state.mode = action.payload.theme
      }
      if (action.payload.language) {
        state.language = action.payload.language
      }
    },
  },
})

export const { setTheme, toggleTheme, setLanguage, initializeFromStorage } = themeSlice.actions
export default themeSlice.reducer
