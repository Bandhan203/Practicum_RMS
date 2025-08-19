import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './features/menuSlice';
import orderReducer from './features/orderSlice';
import userReducer from './features/userSlice';
import reservationReducer from './features/reservationSlice';
import inventoryReducer from './features/inventorySlice';
import analyticsReducer from './features/analyticsSlice';
import authReducer from './features/authSlice';
import notificationReducer from './features/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    orders: orderReducer,
    users: userReducer,
    reservations: reservationReducer,
    inventory: inventoryReducer,
    analytics: analyticsReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
