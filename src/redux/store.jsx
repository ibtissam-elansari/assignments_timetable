import { configureStore } from '@reduxjs/toolkit';
import schedulerReducer from './slices';

const store = configureStore({
  reducer: {
    scheduler: schedulerReducer,
  },
});

export default store;
