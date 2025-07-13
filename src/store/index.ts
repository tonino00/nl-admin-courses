import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Reducers
import authReducer from './slices/authSlice';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import coursesReducer from './slices/coursesSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';

// Configuração de persistência para o reducer de autenticação
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'] // apenas estes campos serão persistidos
};

// Configuração de persistência para o rootReducer
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // apenas o state de auth será persistido
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  students: studentsReducer,
  teachers: teachersReducer,
  courses: coursesReducer,
  enrollments: enrollmentsReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // necessário para permitir que o redux-persist funcione
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
