import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import themeReducer from "./themeSlice"; // new theme slice
import { api } from "../services/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer, // add theme slice here
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
