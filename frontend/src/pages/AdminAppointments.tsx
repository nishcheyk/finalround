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

  // Reschedule dialog states
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
          date: slotDate,
        });
      }
    }
    return slots;
  }, [slotsData, selectedDate, selectedService, servicesData]);

  // Cancel appointment handler from appointments list logic
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

  // Open reschedule dialog and initialize selection from appointment data
  const handleOpenReschedule = (appt: any) => {
    setRescheduleId(String(appt._id));
    setSelectedDate(new Date(appt.startTime));
    setSelectedStaff(appt.staff?._id ?? "");
    setSelectedService(appt.service?._id ?? "");
    setSelectedTime(new Date(appt.startTime).toISOString());
  };

  // Confirm reschedule handler from appointments list logic
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
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 1200, px: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", mb: 4 }}
      >
        Admin Appointments Management
      </Typography>

      {Array.isArray(appointmentsData?.data) &&
      appointmentsData.data.length > 0 ? (
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>User:</strong> {appt.user?.name || "Unknown User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Staff:</strong>{" "}
                    {appt.staff?.user?.name || "Unknown Staff"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" gutterBottom>
                    <strong>Start:</strong>{" "}
                    {new Date(appt.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
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
                      onClick={() => handleCancel(String(appt._id))}
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
        open={Boolean(rescheduleId)}
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
              disabled={!selectedDate || slotsLoading}
            >
              {slotOptions.length > 0 ? (
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
