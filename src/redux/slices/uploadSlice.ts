import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadMemeTemplate, MemeTemplate } from '../../utils/uploadService';

interface UploadState {
  isUploading: boolean;
  success: boolean;
  error: string | null;
  uploadedTemplate: MemeTemplate | null;
}

const initialState: UploadState = {
  isUploading: false,
  success: false,
  error: null,
  uploadedTemplate: null,
};

export const uploadMeme = createAsyncThunk(
  'upload/meme',
  async ({
    file,
    name,
    categories,
    userId,
  }: {
    file: File;
    name: string;
    categories: string[];
    userId?: string;
  }, { rejectWithValue }) => {
    try {
      const result = await uploadMemeTemplate(file, name, categories, userId);
      if (!result) {
        throw new Error('Failed to upload meme template');
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.isUploading = false;
      state.success = false;
      state.error = null;
      state.uploadedTemplate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadMeme.pending, (state) => {
        state.isUploading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(uploadMeme.fulfilled, (state, action) => {
        state.isUploading = false;
        state.success = true;
        state.uploadedTemplate = action.payload;
      })
      .addCase(uploadMeme.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;