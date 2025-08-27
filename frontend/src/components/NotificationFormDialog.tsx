import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Button,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { Public as GlobalIcon } from "@mui/icons-material";
type NotificationType = "info" | "warning" | "error" | "success";
type PriorityType = "low" | "medium" | "high";

interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityType;
  isGlobal: boolean;
}

interface NotificationFormDialogProps {
  open: boolean;
  loading: boolean;
  users: { _id: string; name: string; email: string }[];
  usersLoading: boolean;
  formData: NotificationFormData;
  selectedUsers: string[];
  onFormChange: (field: keyof NotificationFormData, value: any) => void;
  onSelectedUsersChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export const NotificationFormDialog: React.FC<NotificationFormDialogProps> = ({
  open,
  loading,
  users,
  usersLoading,
  formData,
  selectedUsers,
  onFormChange,
  onSelectedUsersChange,
  onClose,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Create New Notification</DialogTitle>
    <DialogContent>
      <Box sx={{ pt: 1 }}>
        <TextField
          fullWidth
          label="Title"
          value={formData.title}
          onChange={(e) => onFormChange("title", e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Message"
          value={formData.message}
          onChange={(e) => onFormChange("message", e.target.value)}
          margin="normal"
          multiline
          rows={3}
          required
        />
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                onFormChange("type", e.target.value as NotificationType)
              }
              label="Type"
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="success">Success</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) =>
                onFormChange("priority", e.target.value as PriorityType)
              }
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {!formData.isGlobal && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Recipients</InputLabel>
            <Select
              multiple
              value={selectedUsers}
              onChange={onSelectedUsersChange}
              label="Recipients"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((userId) => {
                    const user = users.find((u) => u._id === userId);
                    return <Chip key={userId} label={user?.name || userId} />;
                  })}
                </Box>
              )}
            >
              {usersLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            variant={formData.isGlobal ? "contained" : "outlined"}
            onClick={() => onFormChange("isGlobal", !formData.isGlobal)}
            startIcon={<GlobalIcon />}
            fullWidth
          >
            {formData.isGlobal ? "Global Notification" : "Make Global"}
          </Button>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        disabled={!formData.title || !formData.message || loading}
      >
        {loading ? <CircularProgress size={20} /> : "Create"}
      </Button>
    </DialogActions>
  </Dialog>
);
