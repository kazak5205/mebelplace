import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en' | 'kk';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notificationsOpen: boolean;
  searchOpen: boolean;
  loading: {
    global: boolean;
    auth: boolean;
    video: boolean;
    chat: boolean;
    request: boolean;
    call: boolean;
    upload: boolean;
  };
  modals: {
    login: boolean;
    register: boolean;
    profile: boolean;
    settings: boolean;
    videoUpload: boolean;
    requestCreate: boolean;
    call: boolean;
    payment: boolean;
  };
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  pageTitle: string;
  pageDescription: string;
}

// Initial state
const initialState: UIState = {
  theme: 'system',
  language: 'ru',
  sidebarOpen: false,
  mobileMenuOpen: false,
  notificationsOpen: false,
  searchOpen: false,
  loading: {
    global: false,
    auth: false,
    video: false,
    chat: false,
    request: false,
    call: false,
    upload: false,
  },
  modals: {
    login: false,
    register: false,
    profile: false,
    settings: false,
    videoUpload: false,
    requestCreate: false,
    call: false,
    payment: false,
  },
  toasts: [],
  breadcrumbs: [],
  pageTitle: 'MebelPlace',
  pageDescription: 'Платформа для мебельного бизнеса',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'ru' | 'en' | 'kk'>) => {
      state.language = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    addToast: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      duration?: number;
    }>) => {
      const toast = {
        id: Date.now().toString(),
        ...action.payload,
        duration: action.payload.duration || 5000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; href?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action: PayloadAction<{ label: string; href?: string }>) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state, action: PayloadAction<number>) => {
      state.breadcrumbs.splice(action.payload, 1);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    setPageDescription: (state, action: PayloadAction<string>) => {
      state.pageDescription = action.payload;
    },
    setPageMeta: (state, action: PayloadAction<{ title: string; description: string }>) => {
      state.pageTitle = action.payload.title;
      state.pageDescription = action.payload.description;
    },
    resetUI: (state) => {
      return { ...initialState, theme: state.theme, language: state.language };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleNotifications,
  setNotificationsOpen,
  toggleSearch,
  setSearchOpen,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
  setPageTitle,
  setPageDescription,
  setPageMeta,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
