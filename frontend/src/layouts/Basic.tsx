import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

/* This code defines a functional React component named `Basic`. Inside the component function, it uses
the `useAppSelector` hook to extract the `isAuthenticated` and `isLoading` values from the Redux
state related to authentication. */
function Basic() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

/* This part of the code is a conditional check that is used to handle the loading state of the
component. */
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

/* This part of the code is the return statement inside the `Basic` component function. It returns a
JSX structure that consists of a `Box` component from Material-UI with specific styling properties.
The `Box` component is used to create a container element with a minimum height of `100vh` (viewport
height), padding of `3` units, and a background color set to the default background color defined in
the theme (`background.default`). */
  return (
    <Box
      sx={{ minHeight: "100vh", p: 3, backgroundColor: "background.default" }}
    >
      <Outlet />
    </Box>
  );
}

export default Basic;
