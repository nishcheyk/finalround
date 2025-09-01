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
  Skeleton,
  CircularProgress,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import { motion } from "framer-motion";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DateTime } from "luxon";
import {
  useGetStaffQuery,
  useGetServicesQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetUserAppointmentsQuery,
  useGetBusySlotsForStaffQuery,
} from "../services/api";
import { useNavigate } from "react-router-dom";

export function AppointmentsList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch,
  } = useGetUserAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>(""); // store ISO UTC string
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const { data: servicesData, isLoading: servicesLoading } =
    useGetServicesQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();
  console.log("Staff data:", staffData);

  const staffList = useMemo(() => {
    if (!staffData) return [];
    return (staffData as any)?.data || staffData || [];
  }, [staffData]);

  const staffTimeZone: string = "Asia/Kolkata";

  const dateParam = useMemo(() => {
    if (!selectedDate) return "";

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const {
    data: busySlotsData,
    isLoading: busySlotsLoading,
    refetch: refetchBusySlots,
  } = useGetBusySlotsForStaffQuery(
    { staffId: selectedStaff, date: dateParam },
    { skip: !selectedStaff || !selectedDate || !dateParam }
  );

  const servicesList = useMemo(() => {
    if (!servicesData) return [];
    return (servicesData as any)?.data || servicesData || [];
  }, [servicesData]);

  const slotOptions = useMemo(() => {
    if (!selectedDate || !selectedService || !servicesList.length) return [];

    const service = servicesList.find((s: any) => s._id === selectedService);
    if (!service) return [];

    const duration: number = service.duration; // minutes
    const startHour = 9; // opening hour in staff timezone
    const endHour = 22; // closing hour in staff timezone

    const busySlots: string[] = (() => {
      if (!busySlotsData) return [];
      // Handle the API response structure correctly
      if (busySlotsData.success && Array.isArray(busySlotsData.data)) {
        return busySlotsData.data;
      }
      // Fallback for other response formats
      const data = (busySlotsData as any)?.data || busySlotsData;
      return Array.isArray(data) ? data : [];
    })();

    console.log("Received busy slots from backend:", busySlots);

    // Create set for O(1) lookup
    const busySet = new Set(busySlots);

    // Generate slots for the selected calendar date in staff timezone
    const dayStartInStaffTz = DateTime.fromJSDate(selectedDate)
      .setZone(staffTimeZone)
      .startOf("day");

    const slots: Array<{ value: string; label: string }> = [];

    // Generate slots for business hours
    for (
      let mins = startHour * 60;
      mins + duration <= endHour * 60;
      mins += duration
    ) {
      const slotInStaffTz = dayStartInStaffTz.plus({ minutes: mins });
      const slotUtc = slotInStaffTz.toUTC();
      const slotUtcISO = slotUtc.toISO();

      // Debug: Log slot generation
      console.log("Generated slot:", {
        staffTz: slotInStaffTz.toISO(),
        utc: slotUtcISO,
        valid: slotUtc.isValid,
        isBusy: busySet.has(slotUtcISO || ""),
      });

      if (!slotUtcISO || !slotUtc.isValid) continue;

      // Check if this UTC time slot is busy
      if (!busySet.has(slotUtcISO)) {
        slots.push({
          value: slotUtcISO, // Send UTC ISO to backend
          label: slotInStaffTz.toFormat("hh:mm a"), // Display in staff timezone
        });
      }
    }

    console.log("Generated available slots:", slots.length);
    return slots;
  }, [
    busySlotsData,
    selectedDate,
    selectedService,
    servicesList,
    staffTimeZone,
  ]);

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
    console.log("Opening reschedule for appointment:", appointment);

    setRescheduleId(appointment._id);
    const appointmentDate = new Date(appointment.startTime);
    setSelectedDate(appointmentDate);
    setSelectedStaff(appointment.staff?._id || appointment.staff);
    setSelectedService(appointment.service?._id || appointment.service);
    setSelectedSlot("");
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;

    // Debug: Log what we're sending
    console.log("Sending reschedule data to backend:", selectedSlot);
    console.log("Parsed DateTime:", DateTime.fromISO(selectedSlot));

    try {
      await rescheduleAppointment({
        id: rescheduleId!,
        newStartTime: selectedSlot, // UTC ISO string
        staffId: selectedStaff,
        serviceId: selectedService,
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment rescheduled successfully!",
        severity: "success",
      });

      // Reset form and refresh busy slots to show updated availability
      setSelectedSlot("");
      handleCloseReschedule();
      refetch();

      // Refetch busy slots to update the available time slots
      if (selectedStaff && dateParam) {
        refetchBusySlots();
      }
    } catch (error: any) {
      console.error("Reschedule error:", error);
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

  const handleCloseReschedule = () => {
    setRescheduleId(null);
    setSelectedDate(null);
    setSelectedStaff("");
    setSelectedService("");
    setSelectedSlot("");
  };

  const getConfirmationTime = (utcIsoString: string) => {
    const dt = DateTime.fromISO(utcIsoString);
    if (!dt.isValid) return "";
    return dt.setZone(staffTimeZone).toFormat("hh:mm a");
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return "";
    return DateTime.fromJSDate(selectedDate).toFormat("EEEE, MMMM dd, yyyy");
  };

  const formatAppointmentTime = (startTime: string | Date) => {
    const dt = DateTime.fromJSDate(new Date(startTime));
    return dt
      .setZone(staffTimeZone)
      .toFormat("EEEE, MMMM dd, yyyy 'at' hh:mm a");
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Your Appointments
      </Typography>

      {appointmentsLoading ? (
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
                  {formatAppointmentTime(appt.startTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Staff: {appt.staff?.user?.name || "Unknown"}
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
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenReschedule(appt)}
                    disabled={appt.status === "cancelled"}
                    size="small"
                  >
                    Reschedule
                  </Button>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: 4,
              borderRadius: 3,
              boxShadow: 2,
              bgcolor: "background.paper",
              mt: 4,
            }}
          >
            <EventBusyIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              No appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don’t have any scheduled appointments yet. Book one to get
              started!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
            >
              Book Appointment
            </Button>
          </Box>
        </motion.div>
      )}

      <Dialog
        open={Boolean(rescheduleId)}
        onClose={handleCloseReschedule}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box>
            <FormControl sx={{ minWidth: 220, mr: 2, mb: 2 }}>
              {servicesLoading ? (
                <Skeleton variant="rectangular" height={56} />
              ) : (
                <>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedSlot(""); // Reset slot when service changes
                    }}
                    label="Service"
                    disabled={servicesLoading}
                  >
                    {servicesList.map((service: any) => (
                      <MenuItem key={service._id} value={service._id}>
                        {service.name} ({service.duration} min)
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            </FormControl>

            <FormControl sx={{ minWidth: 220, mb: 2 }}>
              {staffLoading ? (
                <Skeleton variant="rectangular" height={56} />
              ) : (
                <>
                  <InputLabel>Staff</InputLabel>
                  <Select
                    value={selectedStaff}
                    onChange={(e) => {
                      setSelectedStaff(e.target.value);
                      setSelectedSlot(""); // Reset slot when staff changes
                    }}
                    label="Staff"
                    disabled={staffLoading}
                  >
                    {staffList.map((staff: any) => (
                      <MenuItem key={staff._id} value={staff._id}>
                        {staff?.user?.name || "Staff"}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            </FormControl>

            {servicesLoading || staffLoading ? (
              <Skeleton variant="rectangular" height={280} sx={{ mb: 3 }} />
            ) : (
              <Box sx={{ mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newDate) => {
                      setSelectedDate(newDate);
                      setSelectedSlot(""); // Reset slot when date changes
                    }}
                    disablePast
                    sx={{ mb: 2 }}
                  />
                </LocalizationProvider>
                {selectedDate && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {getSelectedDateDisplay()}
                  </Typography>
                )}
              </Box>
            )}

            {busySlotsLoading && selectedDate && selectedStaff && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>
                  Loading available times...
                </Typography>
              </Box>
            )}

            {slotOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FormControl sx={{ minWidth: 220, mb: 3 }}>
                  <InputLabel>Available Times</InputLabel>
                  <Select
                    label="Available Times"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    disabled={busySlotsLoading}
                  >
                    {slotOptions.map((slot) => (
                      <MenuItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedSlot && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      New Appointment Details:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Date: {getSelectedDateDisplay()}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Time: {getConfirmationTime(selectedSlot)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Service:{" "}
                      {
                        servicesList.find((s) => s._id === selectedService)
                          ?.name
                      }
                    </Typography>
                  </Box>
                )}
              </motion.div>
            )}

            {slotOptions.length === 0 &&
              selectedDate &&
              selectedService &&
              selectedStaff &&
              !busySlotsLoading && (
                <Typography
                  color="text.secondary"
                  sx={{ mt: 3, textAlign: "center" }}
                >
                  No available slots for the selected date, staff, and service.
                  <br />
                  Please select another date or staff member.
                </Typography>
              )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseReschedule} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReschedule}
            variant="contained"
            disabled={!selectedSlot}
          >
            Confirm Reschedule
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
