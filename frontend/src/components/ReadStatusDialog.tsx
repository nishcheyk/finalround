import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

interface ReadStatusDialogProps {
  open: boolean;
  loading: boolean;
  readUsers: { user: { _id: string; name: string }; readAt: string }[];
  unreadUsers: { _id: string; name: string }[];
  onClose: () => void;
}

const ReadStatusDialog: React.FC<ReadStatusDialogProps> = ({
  open,
  loading,
  readUsers,
  unreadUsers,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notification Read Status</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Read by ({readUsers.length})
            </Typography>
            <List dense>
              {readUsers.map(({ user, readAt }) => (
                <ListItem key={user._id}>
                  <ListItemText
                    primary={user.name}
                    secondary={`Read at: ${new Date(readAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Not Read by ({unreadUsers.length})
            </Typography>
            <List dense>
              {unreadUsers.map((user) => (
                <ListItem key={user._id}>
                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {!loading && readUsers.length === 0 && unreadUsers.length === 0 && (
          <Alert severity="info">No read status available</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadStatusDialog;
