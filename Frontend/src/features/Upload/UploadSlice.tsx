import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';
import { resetStore } from '@/app/resetActions';

interface UploadState {
    file: File | null;
}

const initialState: UploadState = {
    file: null,
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        setFile: (state, action: PayloadAction<File | null>) => {
            state.file = action.payload;
        },
        unsetFile: (state) => {
            state.file = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(resetStore, () => initialState);
    }
});

export const selectFile = (state: RootState) => state.upload.file;
export const { setFile, unsetFile } = uploadSlice.actions;
export default uploadSlice.reducer;
