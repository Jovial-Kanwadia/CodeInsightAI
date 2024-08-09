// src/features/user/UserSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/app/api';
import { RootState } from '@/app/store';
import { displayError, extractErrorMessage } from '@/lib/utils';
import { resetStore } from '@/app/resetActions';

// Define the structure of the avatar and coverImage objects
interface Image {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    original_filename: string;
    api_key: string;
}

// Define the structure of the user object
export interface User {
    _id: string;
    username: string;
    email: string;
    avatar: Image | null;
    coverImage: Image | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
};

interface UpdateUsernamePayload {
    username: string;
}

interface UpdatePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

interface UpdateAvatarPayload {
    avatar: File;
}

interface UpdateCoverImagePayload {
    coverImage: File;
}

// Async Thunk to fetch user from database
export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('users/current-user');
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorMessage = extractErrorMessage(error.response.data)
                displayError(errorMessage)
                return rejectWithValue(error.response.data);
            } else {
                displayError("Failed to fetch user")
                return rejectWithValue('Failed to fetch user');
            }
        }
    }
);

// Async Thunk to update username
export const updateUsername = createAsyncThunk<User, UpdateUsernamePayload, { rejectValue: string }>(
    'user/updateUsername',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.patch('users/update-username', payload);
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorMessage = extractErrorMessage(error.response.data)
                displayError(errorMessage)
                return rejectWithValue(error.response.data);
            } else {
                displayError("Error occured while updating username")
                return rejectWithValue('Error occured while updating username');
            }
        }
    }
);

// Async thunk to update password
export const updatePassword = createAsyncThunk<User, UpdatePasswordPayload, { rejectValue: string }>(
    'user/updatePassword',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('users/change-password', payload);
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorMessage = extractErrorMessage(error.response.data)
                displayError(errorMessage)
                return rejectWithValue(error.response.data);
            } else {
                displayError("An error occured while updating password")
                return rejectWithValue('An error occured while updating password');
            }
        }
    }
);

// Async thunk to update avatar
export const updateAvatar = createAsyncThunk<User, UpdateAvatarPayload, { rejectValue: string }>(
    'user/updateAvatar',
    async (payload, { rejectWithValue }) => {
        const formData = new FormData();
        formData.append('avatar', payload.avatar);

        try {
            const response = await api.patch('users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorMessage = extractErrorMessage(error.response.data)
                displayError(errorMessage)
                return rejectWithValue(error.response.data);
            } else {
                displayError("An error occured while updating avatar")
                return rejectWithValue('An error occured while updating avatar');
            }
        }
    }
);

// Async thunk to update cover image
export const updateCoverImage = createAsyncThunk<User, UpdateCoverImagePayload, { rejectValue: string }>(
    'user/updateCoverImage',
    async (payload, { rejectWithValue }) => {
        const formData = new FormData();
        formData.append('coverImage', payload.coverImage);

        try {
            const response = await api.patch('users/cover-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                const errorMessage = extractErrorMessage(error.response.data)
                displayError(errorMessage)
                return rejectWithValue(error.response.data);
            } else {
                displayError("An error occured while updating cover image")
                return rejectWithValue('An error occured while updating cover image');
            }
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        deleteUser: (state) => {
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload ?? 'An error occurred while fetching user';
            })
            .addCase(updateUsername.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUsername.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(updateUsername.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? 'An error occurred while updating username';
                state.loading = false;
            })
            .addCase(updatePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updatePassword.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? 'An error occurred while updating password';
                state.loading = false;
            })
            .addCase(updateAvatar.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAvatar.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(updateAvatar.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? 'An error occurred while updating avatar';
                state.loading = false;
            })
            .addCase(updateCoverImage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCoverImage.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(updateCoverImage.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? 'An error occurred while updating cover image';
                state.loading = false;
            })
            .addCase(resetStore, () => initialState);
    },
});

export const { deleteUser } = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
