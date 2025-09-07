import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { apiCallsMiddleware } from './middleware/apiCallsMiddleware';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Reducers
import authReducer from './slices/authSlice';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import coursesReducer from './slices/coursesSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import notificationsReducer from './slices/notificationsSlice';
import calendarReducer from './slices/calendarSlice';
import themeReducer from './slices/themeSlice';

// Configuração de persistência para o reducer de autenticação
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'] // apenas estes campos serão persistidos
};

// Configuração de persistência para o tema
const themePersistConfig = {
  key: 'theme',
  storage,
};

// Configuração de persistência para o rootReducer
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme'] // persistir auth e theme
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  students: studentsReducer,
  teachers: teachersReducer,
  courses: coursesReducer,
  enrollments: enrollmentsReducer,
  notifications: notificationsReducer,
  calendar: calendarReducer,
  theme: persistedThemeReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // necessário para permitir que o redux-persist funcione
    }).concat(apiCallsMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
