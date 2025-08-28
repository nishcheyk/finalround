import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Snackbar,
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/system";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  useGetServicesQuery,
  useGetStaffQuery,
  useGetAvailabilityQuery,
  useCreateAppointmentMutation,
  useGetUserAppointmentsQuery,
} from "../services/api";
import { motion } from "framer-motion";

export default function AppointmentBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: servicesData, isLoading: servicesLoading } =
    useGetServicesQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();

  const shouldFetchSlots = selectedService && selectedStaff && selectedDate;
  const { data: slotsData, isLoading: slotsLoading } = useGetAvailabilityQuery(
    {
      staffId: selectedStaff,
      serviceId: selectedService,
      date: selectedDate ? selectedDate.toISOString() : "",
    },
    {
      skip: !shouldFetchSlots,
      refetchOnMountOrArgChange: true,
    }
  );

  const [createAppointment, { isLoading: booking }] =
    useCreateAppointmentMutation();
  const { data: appointmentsData, refetch: refetchAppointments } =
    useGetUserAppointmentsQuery();

  // Memoize the slot options for dropdown
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
      slots.push({
        value: slotISO,
        label: slotDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        booked: bookedSet.has(slotISO),
        date: slotDate,
      });
    }
    return slots;
  }, [slotsData, selectedDate, selectedService, servicesData]);

  const handleBook = async () => {
    if (!selectedSlot) return;

    try {
      await createAppointment({
        staffId: selectedStaff,
        serviceId: selectedService,
        startTime: selectedSlot,
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment booked successfully!",
        severity: "success",
      });
      setSelectedSlot(null);
      refetchAppointments();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to book appointment.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Book an Appointment
      </Typography>

      <FormControl sx={{ minWidth: 220, mr: 2, mb: 2 }}>
        <InputLabel>Service</InputLabel>
        <Select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          label="Service"
          disabled={servicesLoading}
        >
          {servicesData?.data?.map((service) => (
            <MenuItem key={service._id} value={service._id}>
              {service.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>Staff</InputLabel>
        <Select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          label="Staff"
          disabled={staffLoading}
        >
          {staffData?.data?.map((staff) => (
            <MenuItem key={staff._id} value={staff._id}>
              {staff.user?.name || "Staff"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          disablePast
          sx={{ mb: 3 }}
        />
      </LocalizationProvider>

      {slotsLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {slotOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FormControl sx={{ minWidth: 220, mb: 3 }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={selectedSlot ? selectedSlot.toISOString() : ""}
              onChange={(e) => {
                const slot = slotOptions.find(
                  (s) => s.value === e.target.value
                );
                if (slot && !slot.booked) setSelectedSlot(slot.date);
              }}
              label="Time"
              disabled={slotsLoading}
              renderValue={(value) => {
                const slot = slotOptions.find((s) => s.value === value);
                return slot
                  ? slot.label + (slot.booked ? " (Booked)" : "")
                  : "Select Time";
              }}
            >
              {slotOptions.map((slot) => (
                <MenuItem
                  key={slot.value}
                  value={slot.value}
                  disabled={slot.booked}
                >
                  {slot.label} {slot.booked ? "(Booked)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedSlot && (
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBook}
                disabled={booking}
              >
                {booking
                  ? "Booking..."
                  : `Confirm Booking for ${selectedSlot.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
              </Button>
            </Box>
          )}
        </motion.div>
      )}

      {slotOptions.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No available slots for the selected date, staff, and service. Please
          select another date or staff.
        </Typography>
      )}

      {/* Appointments as cards */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Your Appointments
        </Typography>
        {appointmentsData?.data?.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
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
                    alignItems: "flex-start",
                    minHeight: 140,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {appt.service?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={1}
                  ></Typography>
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
                </Box>
              </motion.div>
            ))}
          </Box>
        ) : (
          <Typography>No appointments found</Typography>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
