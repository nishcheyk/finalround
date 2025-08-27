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

  return (
    <Box
      sx={{ minHeight: "100vh", p: 3, backgroundColor: "background.default" }}
    >
      <Outlet />
    </Box>
  );
}

export default Basic;
