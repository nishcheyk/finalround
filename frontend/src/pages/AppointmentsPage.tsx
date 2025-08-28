import React from "react";
import Box from "@mui/material/Box";
import { AppointmentsList } from "../components/AppointmentsList";

export default function AppointmentsPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ p: 2 }}
    >
      <AppointmentsList />
    </Box>
  );
}
