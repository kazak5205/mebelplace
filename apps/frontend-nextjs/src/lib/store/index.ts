import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import videoReducer from './slices/videoSlice';
import chatReducer from './slices/chatSlice';
import requestReducer from './slices/requestSlice';
import notificationReducer from './slices/notificationSlice';
import callReducer from './slices/callSlice';
import analyticsReducer from './slices/analyticsSlice';
import gamificationReducer from './slices/gamificationSlice';
import mapReducer from './slices/mapSlice';
import paymentReducer from './slices/paymentSlice';
import arReducer from './slices/arSlice';
import storyReducer from './slices/storySlice';
import referralReducer from './slices/referralSlice';
import uiReducer from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'ui'], // Only persist these reducers
  blacklist: ['video', 'chat', 'request', 'notification', 'call', 'analytics', 'gamification', 'map', 'payment', 'ar', 'story', 'referral'], // Don't persist these
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  video: videoReducer,
  chat: chatReducer,
  request: requestReducer,
  notification: notificationReducer,
  call: callReducer,
  analytics: analyticsReducer,
  gamification: gamificationReducer,
  map: mapReducer,
  payment: paymentReducer,
  ar: arReducer,
  story: storyReducer,
  referral: referralReducer,
  ui: uiReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';
