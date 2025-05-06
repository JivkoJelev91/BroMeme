import { configureStore } from '@reduxjs/toolkit';
import memeReducer from './slices/memeSlice';

export const store = configureStore({
  reducer: {
    meme: memeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;