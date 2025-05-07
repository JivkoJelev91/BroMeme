import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from '../redux/slices/authSlice';
import uploadReducer from '../redux/slices/uploadSlice';
import memeReducer from '../redux/slices/memeSlice';
// Import your other reducers here

export const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
    meme: memeReducer
    // Add your other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;