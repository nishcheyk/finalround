import React, { useState, useMemo, useEffect } from "react";
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
import { DateTime } from "luxon";
import {
  useGetServicesQuery,
  useGetStaffQuery,
  useGetBusySlotsForStaffQuery,
  useCreateAppointmentMutation,
} from "../services/api";
import {
  Cloud,
  Star,
  Favorite,
  FlashOn,
  EmojiEmotions,
} from "@mui/icons-material";

const floatingIcons = [
  { icon: <Cloud />, size: 40, x: "10%", y: "20%", delay: 0 },
  { icon: <Star />, size: 25, x: "70%", y: "10%", delay: 2 },
  { icon: <Favorite />, size: 30, x: "40%", y: "80%", delay: 1 },
  { icon: <FlashOn />, size: 35, x: "80%", y: "50%", delay: 3 },
  { icon: <EmojiEmotions />, size: 28, x: "25%", y: "60%", delay: 4 },
];

const AnimatedBackground: React.FC<{ blurAmount: number }> = ({
  blurAmount,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        background: "linear-gradient(270deg, #6a11cb 0%, #2575fc 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 15s ease infinite",
        filter: `blur(${blurAmount}px)`,
        transition: "filter 0.3s ease",
        overflow: "hidden",
      }}
    />
  );
};

const FloatingIcon: React.FC<{
  x: string;
  y: string;
  size: number;
  delay: number;
  children: React.ReactNode;
}> = ({ x, y, size, delay, children }) => {
  const floatAnimation = {
    y: [0, 15, 0],
    transition: {
      repeat: Infinity,
      duration: 6,
      delay,
      ease: "easeInOut",
    },
  };
  return (
    <motion.div
      animate={floatAnimation}
      style={{
        position: "fixed",
        top: y,
        left: x,
        fontSize: size,
        color: "rgba(255, 255, 255, 0.6)",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {children}
    </motion.div>
  );
};

export default function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>(""); // store ISO UTC string
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [blur, setBlur] = useState(2);

  useEffect(() => {
    const handleMouseMove = () => {
      setBlur((prev) => Math.min(prev + 0.1, 8));
    };

    const handleMouseLeave = () => {
      setBlur(2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const interval = setInterval(() => {
      setBlur((prev) => (prev > 2 ? prev - 0.05 : prev));
    }, 50);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(interval);
    };
  }, []);
  const { data: servicesData, isLoading: servicesLoading } =
    useGetServicesQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();
  console.log("Staff data:", staffData);

  // Extract staff list and find selected staff
  const staffList = useMemo(() => {
    if (!staffData) return [];
    return (staffData as any)?.data || staffData || [];
  }, [staffData]);

  const selectedStaffObj = useMemo(
    () => staffList?.find((s: any) => s?._id === selectedStaff),
    [staffList, selectedStaff]
  );

  // Use the same timezone as backend - hardcoded to match backend
  const staffTimeZone: string = "Asia/Kolkata";

  // FIXED: Build date parameter without timezone conversion
  const dateParam = useMemo(() => {
    if (!selectedDate) return "";

    // FIXED: Don't convert timezone for date - just format as YYYY-MM-DD
    // The selected date represents the calendar date the user wants
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

  const [createAppointment, { isLoading: booking }] =
    useCreateAppointmentMutation();

  // Extract services list
  const servicesList = useMemo(() => {
    if (!servicesData) return [];
    return (servicesData as any)?.data || servicesData || [];
  }, [servicesData]);

  // FIXED: Generate available time slots with consistent timezone handling
  const slotOptions = useMemo(() => {
    if (!selectedDate || !selectedService || !servicesList.length) return [];

    const service = servicesList.find((s: any) => s._id === selectedService);
    if (!service) return [];

    const duration: number = service.duration; // minutes
    const startHour = 9; // opening hour in staff timezone
    const endHour = 22; // closing hour in staff timezone

    // FIXED: Extract busy slots from API response (now UTC strings)
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

  const handleBook = async () => {
    if (!selectedSlot) return;

    // Debug: Log what we're sending
    console.log("Sending startTime to backend:", selectedSlot);
    console.log("Parsed DateTime:", DateTime.fromISO(selectedSlot));

    try {
      await createAppointment({
        staffId: selectedStaff,
        serviceId: selectedService,
        startTime: selectedSlot, // UTC ISO string
      }).unwrap();

      setSnackbar({
        open: true,
        message: "Appointment booked successfully!",
        severity: "success",
      });

      // Reset form and refresh busy slots to show updated availability
      setSelectedSlot("");

      // Refetch busy slots to update the available time slots
      if (selectedStaff && dateParam) {
        refetchBusySlots();
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      setSnackbar({
        open: true,
        message: error?.data?.message || "Failed to book appointment.",
        severity: "error",
      });
    }
  };

  // FIXED: Get display time for confirmation button (show in staff timezone consistently)
  const getConfirmationTime = (utcIsoString: string) => {
    const dt = DateTime.fromISO(utcIsoString);
    if (!dt.isValid) return "";

    // FIXED: Show in staff timezone to match slot labels
    return dt.setZone(staffTimeZone).toFormat("hh:mm a");
  };

  // Helper function to format selected date for display
  const getSelectedDateDisplay = () => {
    if (!selectedDate) return "";
    return DateTime.fromJSDate(selectedDate).toFormat("EEEE, MMMM dd, yyyy");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ p: 2, position: "relative", overflow: "hidden" }}
      >
        <AnimatedBackground blurAmount={blur} />
        {floatingIcons.map(({ icon, x, y, size, delay }, idx) => (
          <FloatingIcon key={idx} x={x} y={y} size={size} delay={delay}>
            {icon}
          </FloatingIcon>
        ))}
        <Box>
          <Typography variant="h4" gutterBottom>
            Book an Appointment
          </Typography>

          {/* Service Selection */}
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

          {/* Staff Selection */}
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

          {/* Date Selection */}
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

          {/* Loading indicator for busy slots */}
          {busySlotsLoading && selectedDate && selectedStaff && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading available times...</Typography>
            </Box>
          )}

          {/* Time Slot Selection */}
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

              {/* Confirmation Button */}
              {selectedSlot && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Booking Details:
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
                    {servicesList.find((s) => s._id === selectedService)?.name}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleBook}
                    disabled={booking}
                    sx={{ minWidth: 200 }}
                  >
                    {booking ? "Booking..." : "Confirm Booking"}
                  </Button>
                </Box>
              )}
            </motion.div>
          )}

          {/* No Available Slots Message */}
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

          {/* Snackbar for notifications */}
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
        <style>
          {`
        @keyframes gradientAnimation {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
        `}
        </style>
      </Box>
    </motion.div>
  );
}
