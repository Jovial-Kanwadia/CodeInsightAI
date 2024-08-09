// src/features/auth/AuthSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/app/api';
import { displayError, extractErrorMessage } from '@/lib/utils';
import { resetStore } from '@/app/resetActions';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
};

interface Credentials {
  email: string;
  password: string;
}

// Async thunk for logging in
export const login = createAsyncThunk('auth/login', async (credentials: Credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('users/login', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorMessage = extractErrorMessage(error.response.data)
      displayError(errorMessage)
      return rejectWithValue(error.response.data);
    } else {
      displayError("An error occurred in login thunk")
      return rejectWithValue('An error occurred in login thunk');
    }
  }
});

// Async thunk for logging out
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('users/logout');
    dispatch(logoutSuccess());
    dispatch(resetStore());
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorMessage = extractErrorMessage(error.response.data)
      displayError(errorMessage)
      displayError("An error occurred in logout thunk")
      return rejectWithValue(error.response.data);
    } else {
      return rejectWithValue('An error occurred in logout thunk');
    }
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutSuccess: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
    });
    builder.addCase(resetStore, () => initialState);
  },
});

export const { logoutSuccess, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
