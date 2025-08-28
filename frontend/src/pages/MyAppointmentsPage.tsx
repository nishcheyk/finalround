import React, { useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} from "../services/api";

export default function MyAppointmentsPage() {
  const { data: appointmentsData, refetch } = useGetUserAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [openReschedule, setOpenReschedule] = useState(false);

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointment(id).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment cancelled.",
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

  // For demo: reschedule just adds 1 day
  const handleReschedule = async () => {
    if (!selectedAppt) return;
    const newDate = new Date(selectedAppt.startTime);
    newDate.setDate(newDate.getDate() + 1);
    try {
      await rescheduleAppointment({
        id: selectedAppt._id,
        newStartTime: newDate,
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment rescheduled.",
        severity: "success",
      });
      setOpenReschedule(false);
      setSelectedAppt(null);
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to reschedule appointment.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>
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
            <Button
              color="error"
              onClick={() => handleCancel(appt._id)}
              sx={{ mr: 1 }}
              disabled={appt.status === "cancelled"}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSelectedAppt(appt);
                setOpenReschedule(true);
              }}
              disabled={appt.status === "cancelled"}
            >
              Reschedule
            </Button>
          </ListItem>
        ))}
      </List>
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
      <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Reschedule to{" "}
            {selectedAppt &&
              new Date(
                new Date(selectedAppt.startTime).setDate(
                  new Date(selectedAppt.startTime).getDate() + 1
                )
              ).toLocaleString()}
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReschedule(false)}>Cancel</Button>
          <Button onClick={handleReschedule} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
