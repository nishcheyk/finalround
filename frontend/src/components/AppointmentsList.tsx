import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  useCancelAppointmentMutation,
  useGetUserAppointmentsQuery,
  useRescheduleAppointmentMutation,
} from "../services/api";

export function AppointmentsList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { data: appointmentsData, refetch } = useGetUserAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newRescheduleTime, setNewRescheduleTime] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment cancelled successfully.",
        severity: "success",
      });
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to cancel appointment.",
        severity: "error",
      });
    }
  };

  const handleStartReschedule = (appointmentId: string) => {
    setRescheduleId(appointmentId);
    setNewRescheduleTime("");
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleId || !newRescheduleTime) return;
    try {
      await rescheduleAppointment({
        id: rescheduleId,
        newStartTime: new Date(newRescheduleTime),
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment rescheduled successfully.",
        severity: "success",
      });
      setRescheduleId(null);
      setNewRescheduleTime("");
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

  const handleCancelReschedule = () => {
    setRescheduleId(null);
    setNewRescheduleTime("");
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>
      {appointmentsData?.data?.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMdUp
              ? "1fr 1fr 1fr"
              : isSmUp
                ? "1fr 1fr"
                : "1fr",
            gap: 3,
            mt: 2,
          }}
        >
          {appointmentsData.data.map((appt: any) => (
            <motion.div
              key={appt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 140,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {appt.service?.name}
                </Typography>
                <Typography variant="body2" mb={1}>
                  {new Date(appt.startTime).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  color={
                    appt.status === "scheduled"
                      ? "primary"
                      : appt.status === "completed"
                        ? "success.main"
                        : appt.status === "cancelled"
                          ? "error.main"
                          : "warning.main"
                  }
                  fontWeight="bold"
                  sx={{ mt: "auto" }}
                >
                  Status: {appt.status}
                </Typography>

                <Box sx={{ mt: 2, width: "100%", display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(appt._id)}
                    disabled={appt.status === "cancelled"}
                  >
                    Cancel
                  </Button>

                  {rescheduleId === appt._id ? (
                    <>
                      <input
                        type="datetime-local"
                        value={newRescheduleTime}
                        onChange={(e) => setNewRescheduleTime(e.target.value)}
                        style={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmReschedule}
                        disabled={!newRescheduleTime}
                      >
                        Confirm
                      </Button>
                      <Button variant="text" onClick={handleCancelReschedule}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => handleStartReschedule(appt._id)}
                      disabled={appt.status === "cancelled"}
                    >
                      Reschedule
                    </Button>
                  )}
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      ) : (
        <Typography>No appointments found</Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
