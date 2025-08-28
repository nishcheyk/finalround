import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { motion } from "framer-motion";
import {
  useGetServicesQuery,
  useGetStaffQuery,
  useGetBusySlotsForStaffQuery,
  useCreateAppointmentMutation,
} from "../services/api";

/**
 * The `BookingForm` function in TypeScript React handles booking appointments by selecting services,
 * staff, dates, and available time slots, with error handling and feedback using state hooks and API
 * queries.
 */
export default function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();

  const { data: busySlotsData, isLoading: busySlotsLoading } = useGetBusySlotsForStaffQuery(
    {
      staffId: selectedStaff,
      date: selectedDate ? selectedDate.toISOString().substring(0, 10) : "",
    },
    { skip: !selectedStaff || !selectedDate }
  );

  const [createAppointment, { isLoading: booking }] = useCreateAppointmentMutation();

/* The `slotOptions` constant is using the `useMemo` hook to memoize the calculation of available time
slots for booking appointments. Here's a breakdown of what the code inside `useMemo` is doing: */
  const slotOptions = useMemo(() => {
    if (!selectedDate || !selectedService || !servicesData) return [];

    // Adjust this if your servicesData is an array or has .data
    const servicesList = (servicesData as any).data || servicesData;
    const service = servicesList.find((s: any) => s._id === selectedService);
    if (!service) return [];

    const duration = service.duration;
    const startHour = 9;
    const endHour = 22;
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);


    const busySlotsList = busySlotsData?.busySlots || [];
    const busySet = new Set(busySlotsList);

    const slots = [];
    for (let mins = startHour * 60; mins + duration <= endHour * 60; mins += duration) {
      const slotDate = new Date(baseDate.getTime() + mins * 60000);
      const slotISO = slotDate.toISOString();

      if (!busySet.has(slotISO)) {
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
  }, [busySlotsData, selectedDate, selectedService, servicesData]);

 /**
  * The function `handleBook` is responsible for booking an appointment with error handling and
  * displaying appropriate messages.
  * @returns If the `selectedSlot` is not truthy (e.g., null, undefined, false, 0, ""), the
  * `handleBook` function will return early and not proceed with booking the appointment.
  */
  const handleBook = async () => {
    if (!selectedSlot) return;

    try {
      await createAppointment({
        staffId: selectedStaff,
        serviceId: selectedService,
        startTime: selectedSlot.toISOString(), // send ISO string
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment booked successfully!",
        severity: "success",
      });
      setSelectedSlot(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to book appointment.",
        severity: "error",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Book an Appointment
        </Typography>

        <FormControl sx={{ minWidth: 220, mr: 2, mb: 2 }}>
          {servicesLoading ? (
            <Skeleton variant="rectangular" height={56} />
          ) : (
            <>
              <InputLabel>Service</InputLabel>
              <Select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                label="Service"
                disabled={servicesLoading}
              >
                {(servicesData as any)?.data?.map((service: any) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.name}
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
                onChange={(e) => setSelectedStaff(e.target.value)}
                label="Staff"
                disabled={staffLoading}
              >
                {(staffData as any)?.data?.map((staff: any) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.user?.name || "Staff"}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </FormControl>

        {servicesLoading || staffLoading ? (
          <Skeleton variant="rectangular" height={280} sx={{ mb: 3 }} />
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setSelectedSlot(null);
              }}
              disablePast
              sx={{ mb: 3 }}
            />
          </LocalizationProvider>
        )}

        {busySlotsLoading && <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />}

        {slotOptions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <FormControl sx={{ minWidth: 220, mb: 3 }}>
              <InputLabel>Time</InputLabel>
              <Select
                label="Time"
                value={selectedSlot ? selectedSlot.toISOString() : ""}
                onChange={(e) => {
                  const slot = slotOptions.find((s) => s.value === e.target.value);
                  if (slot) setSelectedSlot(new Date(slot.value));
                }}
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
              <Box sx={{ textAlign: "center" }}>
                <Button variant="contained" color="primary" size="large" onClick={handleBook} disabled={booking}>
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

        {slotOptions.length === 0 && selectedDate && !busySlotsLoading && (
          <Typography color="text.secondary" sx={{ mt: 3 }}>
            No available slots for the selected date, staff, and service. Please select another date or staff.
          </Typography>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
}
