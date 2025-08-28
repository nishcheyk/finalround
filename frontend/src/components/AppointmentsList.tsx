/* The above code is a TypeScript React component called `AppointmentsList`. Here is a summary of what
the code is doing: */
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
  Skeleton,
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

/* The above code is a TypeScript React component called `AppointmentsList`. */
export function AppointmentsList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch,
  } = useGetUserAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();

  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();
  const { data: servicesData } = useGetServicesQuery();

  // Reschedule dialog state
  /* These lines of code are initializing state variables using the `useState` hook in a TypeScript
  React component called `AppointmentsList`. Here is a breakdown of what each state variable is used
  for: */
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const slotOptions = useMemo(() => {
    if (!selectedDate) return [];

    const startHour = 9;
    const endHour = 22; // slots from 9 AM to 10 PM
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

  // Reset selectedTime if it’s not a valid option (to avoid MUI warnings)
  useEffect(() => {
    if (
      selectedTime &&
      !slotOptions.some((slot) => slot.value === selectedTime)
    ) {
      setSelectedTime("");
    }
  }, [slotOptions, selectedTime]);

  /**
   * The function `handleCancel` cancels an appointment, displays a success message if successful, and
   * an error message if unsuccessful.
   * @param {string} appointmentId - The `appointmentId` parameter is a string that represents the
   * unique identifier of the appointment that needs to be cancelled. This identifier is used to locate
   * and cancel the specific appointment in the system.
   */
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

 /**
  * The function `handleOpenReschedule` sets the state with appointment details for rescheduling.
  * @param {any} appointment - The `handleOpenReschedule` function takes an `appointment` object as a
  * parameter. The appointment object likely contains information about a scheduled appointment, such
  * as `_id`, `startTime`, `staffId`, and `serviceId`. The function then sets various state variables
  * based on the values from the `
  */
  const handleOpenReschedule = (appointment: any) => {
    setRescheduleId(appointment._id);
    setSelectedDate(new Date(appointment.startTime));
    setSelectedStaff(appointment.staffId);
    setSelectedService(appointment.serviceId);
    setSelectedTime(new Date(appointment.startTime).toISOString());
  };

 /**
  * The function `handleConfirmReschedule` checks for required fields, sends a request to reschedule an
  * appointment, and displays a corresponding message based on the outcome.
  * @returns If any of the required fields are missing, a warning message is set in the snackbar and
  * the function returns without further execution. If all required fields are present, an attempt is
  * made to reschedule the appointment using the provided data. If successful, a success message is set
  * in the snackbar, the reschedule modal is closed, and a refetch is triggered. If an error occurs
  * during the
  */
  const handleConfirmReschedule = async () => {
    if (
      !rescheduleId ||
      !selectedDate ||
      !selectedStaff ||
      !selectedService ||
      !selectedTime
    ) {
      setSnackbar({
        open: true,
        message: "Please select all fields before confirming.",
        severity: "warning",
      });
      return;
    }

    try {
      const payload = {
        id: rescheduleId,
        newStartTime: selectedTime,
        staffId: selectedStaff,
        serviceId: selectedService,
      };

      await rescheduleAppointment(payload).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment rescheduled successfully.",
        severity: "success",
      });

      handleCloseReschedule();
      refetch();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

/**
 * The `handleCloseReschedule` function resets the state values for rescheduleId, selectedDate,
 * selectedStaff, selectedService, and selectedTime to null or an empty string.
 */
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

      {appointmentsLoading ? (
        // Skeleton loading state
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
          {[...Array(3)].map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rectangular"
              height={140}
              animation="wave"
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : Array.isArray(appointmentsData?.data) &&
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

          <FormControl fullWidth>
            <InputLabel>Staff</InputLabel>
            <Select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              label="Staff"
            >
              {staffData?.data?.map((staff: any) => (
                <MenuItem key={staff._id} value={staff._id}>
                  {staff.user?.name || "Staff"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Service</InputLabel>
            <Select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              label="Service"
            >
              {servicesData?.data?.map((service: any) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
          <Button onClick={handleConfirmReschedule}>Confirm</Button>
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
