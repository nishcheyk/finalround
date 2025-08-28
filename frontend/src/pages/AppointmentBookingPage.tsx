import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  useGetServicesQuery,
  useGetStaffQuery,
  useGetAvailabilityQuery,
  useCreateAppointmentMutation,
  useGetUserAppointmentsQuery,
} from "../services/api";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemButton,
} from "@mui/material";

export default function AppointmentBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data: servicesData, isLoading: servicesLoading } =
    useGetServicesQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffQuery();
  const [fetchSlots, setFetchSlots] = useState(false);
  const {
    data: slotsData,
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useGetAvailabilityQuery(
    {
      staffId: selectedStaff,
      serviceId: selectedService,
      date: selectedDate ? selectedDate.toISOString() : "",
    },
    { skip: !fetchSlots || !selectedStaff || !selectedService || !selectedDate }
  );
  const [createAppointment, { isLoading: booking }] =
    useCreateAppointmentMutation();
  const { data: appointmentsData, refetch: refetchAppointments } =
    useGetUserAppointmentsQuery();

  // Only fetch slots when user clicks button
  useEffect(() => {
    if (!fetchSlots) return;
    if (selectedStaff && selectedService && selectedDate) {
      refetchSlots();
    }
  }, [fetchSlots, selectedStaff, selectedService, selectedDate, refetchSlots]);

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
      setOpenConfirm(false);
      setSelectedSlot(null);
      refetchAppointments();
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to book appointment.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Book an Appointment
      </Typography>
      <FormControl sx={{ minWidth: 200, mr: 2 }} disabled={servicesLoading}>
        <InputLabel>Service</InputLabel>
        <Select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          label="Service"
        >
          {Array.isArray(servicesData)
            ? servicesData.map((service: any) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name}
                </MenuItem>
              ))
            : servicesData?.data?.map((service: any) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.name}
                </MenuItem>
              ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 200, mr: 2 }} disabled={staffLoading}>
        <InputLabel>Staff</InputLabel>
        <Select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          label="Staff"
        >
          {Array.isArray(staffData)
            ? staffData.map((staff: any) => (
                <MenuItem key={staff._id} value={staff._id}>
                  {staff.user?.name || "Staff"}
                </MenuItem>
              ))
            : staffData?.data?.map((staff: any) => (
                <MenuItem key={staff._id} value={staff._id}>
                  {staff.user?.name || "Staff"}
                </MenuItem>
              ))}
        </Select>
      </FormControl>
      <Box sx={{ my: 2 }}>
        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(date as Date)}
        />
      </Box>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        disabled={
          !selectedService || !selectedStaff || !selectedDate || slotsLoading
        }
        onClick={() => setFetchSlots(true)}
      >
        {slotsLoading ? "Loading Slots..." : "Show Available Slots"}
      </Button>
      {fetchSlots && (
        <>
          {slotsLoading && <Typography>Loading slots...</Typography>}
          {!slotsLoading && (!slotsData || slotsData.length === 0) && (
            <Typography color="text.secondary">
              No available slots for this selection.
            </Typography>
          )}
          {!slotsLoading && slotsData && slotsData.length > 0 && (
            <Box>
              <Typography variant="h6">Available Slots</Typography>
              <List>
                {slotsData.map((slot: string) => (
                  <ListItem disablePadding key={slot}>
                    <ListItemButton
                      onClick={() => {
                        setSelectedSlot(new Date(slot));
                        setOpenConfirm(true);
                      }}
                    >
                      <ListItemText
                        primary={new Date(slot).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </>
      )}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Book appointment on {selectedDate?.toLocaleDateString()} at{" "}
            {selectedSlot?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleBook} disabled={booking} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Your Appointments</Typography>
        <List>
          {appointmentsData?.data?.map((appt: any) => (
            <ListItem key={appt._id}>
              <ListItemText
                primary={`${appt.service?.name} with ${appt.staff?.user?.name} on ${new Date(appt.startTime).toLocaleString()}`}
                secondary={
                  <>
                    <b>Status:</b> {appt.status}
                    {appt.status === "cancelled" && (
                      <span style={{ color: "red", marginLeft: 8 }}>
                        (Cancelled)
                      </span>
                    )}
                    {appt.status === "completed" && (
                      <span style={{ color: "green", marginLeft: 8 }}>
                        (Completed)
                      </span>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
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
