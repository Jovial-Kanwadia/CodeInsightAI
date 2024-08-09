// src/app/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session'; // use session storage instead of local storage

import authReducer from '@/features/auth/AuthSlice';
import userReducer from '@/features/user/UserSlice';
import { resetStore } from '@/app/resetActions'; // Import the reset action

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage: sessionStorage, // use sessionStorage here
};

// Create a persisted reducer
const persistedReducer = (state: any, action: any) => {
  if (action.type === resetStore.type) {
    state = undefined; // Reset the state to undefined to trigger a reset
  }
  return rootReducer(state, action);
};

// Create the store with the persisted reducer
export const store = configureStore({
  reducer: persistReducer(persistConfig, persistedReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'upload/setFile'],
        ignoredPaths: ['upload.file'],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
