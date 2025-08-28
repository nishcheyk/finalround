import React, { useState, useMemo } from "react";
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
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import {
  useGetAllAppointmentsQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetAvailabilityQuery,
  useGetStaffQuery,
  useGetServicesQuery,
} from "../services/api";

export default function AdminAppointments() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { data: appointmentsData, refetch } = useGetAllAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();
  const { data: staffData } = useGetStaffQuery();
  const { data: servicesData } = useGetServicesQuery();

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

  const shouldFetchSlots = selectedStaff && selectedService && selectedDate;
  const { data: slotsData, isLoading: slotsLoading } = useGetAvailabilityQuery(
    {
      staffId: selectedStaff,
      serviceId: selectedService,
      date: selectedDate?.toISOString() ?? "",
    },
    { skip: !shouldFetchSlots, refetchOnMountOrArgChange: true }
  );

/* The above code snippet is a TypeScript React component that uses the `useMemo` hook to generate a
list of available time slots based on selected date, selected service, and services data. Here's a
breakdown of what the code is doing: */
  const slotOptions = useMemo(() => {
    if (!selectedDate || !selectedService || !servicesData) return [];

    const service = servicesData.data?.find(
      (s: any) => s._id === selectedService
    );
    if (!service) return [];

    const duration = service.duration;
    const startHour = 9;
    const endHour = 22;
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);

    const bookedSet = new Set(
      (slotsData?.bookedSlots || []).map((bs: any) =>
        new Date(bs).toISOString()
      )
    );

    const slots = [];
    for (
      let mins = startHour * 60;
      mins + duration <= endHour * 60;
      mins += duration
    ) {
      const slotDate = new Date(baseDate.getTime() + mins * 60000);
      const slotISO = slotDate.toISOString();
      if (!bookedSet.has(slotISO)) {
        slots.push({
          value: slotISO,
          label: slotDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }

    return slots;
  }, [slotsData, selectedDate, selectedService, servicesData]);

/**
 * The handleCancel function is used to cancel an appointment, displaying a success message if
 * successful and an error message if unsuccessful.
 * @param {string} id - The `id` parameter in the `handleCancel` function is a string that represents
 * the unique identifier of the appointment that needs to be cancelled.
 */
  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id).unwrap();
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
 * The function `handleOpenReschedule` sets various state values based on the properties of the
 * appointment object passed as a parameter.
 * @param {any} appt - The `handleOpenReschedule` function takes an `appt` parameter, which seems to be
 * an object representing an appointment. The function then extracts various properties from this
 * `appt` object such as `_id`, `startTime`, `staff`, and `service` to set state values like `
 */
  const handleOpenReschedule = (appt: any) => {
    setRescheduleId(String(appt._id));
    setSelectedDate(new Date(appt.startTime));
    setSelectedStaff(appt.staff?._id ?? "");
    setSelectedService(appt.service?._id ?? "");
    setSelectedTime(new Date(appt.startTime).toISOString());
  };

/**
 * The function `handleConfirmReschedule` is used to handle the confirmation of rescheduling an
 * appointment with error handling and displaying appropriate messages.
 * @returns If any of the conditions `!rescheduleId`, `!selectedDate`, `!selectedStaff`,
 * `!selectedService`, or `!selectedTime` are true, the function `handleConfirmReschedule` will return
 * early and not execute the rest of the code block.
 */
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
        staffId: selectedStaff,
        serviceId: selectedService,
        newStartTime: selectedTime,
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment rescheduled successfully.",
        severity: "success",
      });
      handleCloseReschedule();
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

  /**
   * The function `handleCloseReschedule` resets various state variables to null or empty strings.
   */
  const handleCloseReschedule = () => {
    setRescheduleId(null);
    setSelectedDate(null);
    setSelectedStaff("");
    setSelectedService("");
    setSelectedTime("");
  };

  /* The above code is a TypeScript React component for managing appointments in an admin dashboard.
  Here's a breakdown of what the code is doing: */
  return (
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 1200, px: 2 }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
      >
        Admin Appointments Management
      </Typography>

      {appointmentsData?.data?.length ? (
        <Grid container spacing={3}>
          {appointmentsData.data.map((appt: any) => (
            <Grid item xs={12} sm={6} md={4} key={String(appt._id)}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {appt.service?.name || "Unknown Service"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>User:</strong> {appt.user?.name || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Staff:</strong>{" "}
                    {appt.staff?.user?.name || "Unknown"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Start:</strong>{" "}
                    {new Date(appt.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>End:</strong>{" "}
                    {new Date(appt.endTime).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={
                      appt.status === "scheduled"
                        ? "primary.main"
                        : appt.status === "completed"
                        ? "success.main"
                        : appt.status === "cancelled"
                        ? "error.main"
                        : "warning.main"
                    }
                    sx={{ mt: "auto" }}
                  >
                    Status: {appt.status}
                  </Typography>

                  <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      disabled={appt.status === "cancelled"}
                      onClick={() => handleCancel(appt._id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={appt.status === "cancelled"}
                      onClick={() => handleOpenReschedule(appt)}
                    >
                      Reschedule
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center" sx={{ mt: 8 }}>
          No appointments found.
        </Typography>
      )}

      <Dialog
        open={!!rescheduleId}
        onClose={handleCloseReschedule}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setSelectedTime(""); // reset selected time
              }}
              disablePast
            />
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              label="Time"
              disabled={!selectedDate || slotsLoading}
            >
              {slotOptions.length ? (
                slotOptions.map((slot) => (
                  <MenuItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No available slots</MenuItem>
              )}
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
