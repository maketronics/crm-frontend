import { configureStore } from '@reduxjs/toolkit';
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
import storage from 'redux-persist/lib/storage';
import kanbanReducer from './kanbanSlice';

const persistConfig = {
  key: 'kanban',
  version: 1,
  storage,
  whitelist: ['stageCache'],
};

const persistedKanbanReducer = persistReducer(persistConfig, kanbanReducer);

export const store = configureStore({
  reducer: {
    kanban: persistedKanbanReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;