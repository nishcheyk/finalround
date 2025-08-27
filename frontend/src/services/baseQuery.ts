import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  setCredentials,
  resetCredentials,
} from "../store/reducers/authReducer";
import { RootState } from "../store/store";

import { Mutex } from "async-mutex";

const baseUrl = "http://localhost:3000/api";
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include', // Include cookies for refresh token
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    // @ts-ignore
    result.error.data?.message?.toLowerCase().includes("token expired")
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const state = api.getState() as RootState;
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          api.dispatch(resetCredentials());
          return result;
        }

        const refreshResult = await baseQuery(
          {
            url: "/users/refresh-token",
            method: "POST",
            // No need to pass refresh token in body since it's in httpOnly cookie
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // @ts-ignore
          const { token: newToken } = refreshResult.data;

          const state = api.getState() as RootState;
          // Keep existing user info since refresh response likely has no user info
          const user = state.auth.user;

          api.dispatch(
            setCredentials({
              accessToken: newToken,
              refreshToken: "", // Refresh token is handled via httpOnly cookies
              user: user || null,
            })
          );

          // Retry original request with new token
          result = await baseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};
