import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("access_token") ?? "",
  refreshToken: localStorage.getItem("refresh_token") ?? "",
  isAuthenticated: Boolean(localStorage.getItem("access_token")),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: User | null;
      }>
    ) => {
      const { accessToken, refreshToken, user } = action.payload;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.user = user;
      state.isLoading = false;
      state.error = null;
    },
    resetCredentials: (state) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      state.accessToken = "";
      state.refreshToken = "";
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setCredentials, resetCredentials, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;
