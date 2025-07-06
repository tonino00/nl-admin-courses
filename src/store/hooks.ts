import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use este hook em vez de useDispatch simples
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use este hook em vez de useSelector simples
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
