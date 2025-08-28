import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  useGetStaffQuery,
  useGetServicesQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetUserAppointmentsQuery,
} from "../services/api";

export function AppointmentsList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { data: appointmentsData, refetch } = useGetUserAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();

  const { data: staffData } = useGetStaffQuery();
  const { data: servicesData } = useGetServicesQuery();

  // Reschedule dialog state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const slotOptions = useMemo(() => {
    if (!selectedDate) return [];

    const startHour = 9;
    const endHour = 22; // show slots only 9 to 10 AM
    const duration = 30; // 30 mins slot duration
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);

    const slots = [];
    for (
      let mins = startHour * 60;
      mins + duration <= endHour * 60;
      mins += duration
    ) {
      const slotDate = new Date(baseDate.getTime() + mins * 60000);
      const slotISO = slotDate.toISOString();
      slots.push({
        value: slotISO,
        label: slotDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
    return slots;
  }, [selectedDate]);

  // Reset selectedTime if it is not a valid option to avoid MUI warning
  useEffect(() => {
    if (
      selectedTime &&
      !slotOptions.some((slot) => slot.value === selectedTime)
    ) {
      setSelectedTime("");
    }
  }, [slotOptions, selectedTime]);

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

  const handleOpenReschedule = (appointment: any) => {
    setRescheduleId(appointment._id);
    setSelectedDate(new Date(appointment.startTime));
    setSelectedStaff(appointment.staffId);
    setSelectedService(appointment.serviceId);
    setSelectedTime(new Date(appointment.startTime).toISOString());
  };

  const handleConfirmReschedule = async () => {
    if (
      !rescheduleId ||
      !selectedDate ||
      !selectedStaff ||
      !selectedService ||
      !selectedTime
    )
      return;

    try {
      await rescheduleAppointment({
        id: rescheduleId,
        newStartTime: new Date(selectedTime),
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment rescheduled successfully.",
        severity: "success",
      });
      setRescheduleId(null);
      setSelectedDate(null);
      setSelectedStaff("");
      setSelectedService("");
      setSelectedTime("");
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

  const handleCloseReschedule = () => {
    setRescheduleId(null);
    setSelectedDate(null);
    setSelectedStaff("");
    setSelectedService("");
    setSelectedTime("");
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>

      {Array.isArray(appointmentsData?.data) &&
      appointmentsData.data.length > 0 ? (
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
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenReschedule(appt)}
                    disabled={appt.status === "cancelled"}
                  >
                    Reschedule
                  </Button>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      ) : (
        <Typography>No appointments found</Typography>
      )}

      <Dialog
        open={Boolean(rescheduleId)}
        onClose={handleCloseReschedule}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              disablePast
            />
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              label="Time"
              disabled={!selectedDate}
            >
              {slotOptions.map((slot) => (
                <MenuItem key={slot.value} value={slot.value}>
                  {slot.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseReschedule}>Cancel</Button>
          <Button onClick={handleConfirmReschedule} disabled={!selectedTime}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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
