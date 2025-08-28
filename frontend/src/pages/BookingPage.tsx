import React from "react";
import Box from "@mui/material/Box";
import BookingForm from "../components/BookingForm";

export default function BookingPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ p: 2 }}
    >
      <BookingForm />
    </Box>
  );
}
