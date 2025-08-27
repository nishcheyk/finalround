import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { useManualRefreshTokenMutation } from "../services/api";


export default function ManualRefreshButton() {
  const [manualRefreshToken, { isLoading, error, data }] =
    useManualRefreshTokenMutation();

  const handleClick = async () => {
    try {
      const result = await manualRefreshToken().unwrap();
      console.log("Manual refresh successful, new token:", result.token);
      // You probably want to update your auth state here by dispatching setCredentials with new token
    } catch (err) {
      console.error("Manual refresh failed", err);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <CircularProgress size={24} /> : "Manual Refresh Token"}
    </Button>
  );
}
