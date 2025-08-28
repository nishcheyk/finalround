import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Public as GlobalIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

type NotificationType = "info" | "warning" | "error" | "success";
type PriorityType = "low" | "medium" | "high";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: PriorityType;
  isGlobal: boolean;
  sender: { name: string };
  createdAt: string;
  expiresAt?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  deleting: boolean;
  onDelete: (id: string) => void;
  onViewReadStatus: (id: string) => void;
  loading: boolean;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "info":
      return <InfoIcon color="info" />;
    case "warning":
      return <WarningIcon color="warning" />;
    case "error":
      return <ErrorIcon color="error" />;
    case "success":
      return <SuccessIcon color="success" />;
    default:
      return <InfoIcon />;
  }
};

const getPriorityColor = (priority: PriorityType) => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "default";
  }
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  deleting,
  onDelete,
  onViewReadStatus,
  loading,
}) => {
  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  if (notifications.length === 0)
    return (
      <Typography color="textSecondary" p={3}>
        No notifications found
      </Typography>
    );

  return (
    <List>
      {notifications.map((notification, idx) => (
        <React.Fragment key={notification._id}>
          <ListItem
            alignItems="flex-start"
            secondaryAction={
              <IconButton
                edge="end"
                color="error"
                onClick={() => onDelete(notification._id)}
                disabled={deleting}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ flexGrow: 1 }}
            >
              {getNotificationIcon(notification.type)}
              <Box sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {notification.title}
                  </Typography>
                  <Chip
                    label={notification.priority}
                    size="small"
                    color={getPriorityColor(notification.priority) as any}
                  />
                  {notification.isGlobal && (
                    <Chip
                      icon={<GlobalIcon />}
                      label="Global"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {notification.message}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="caption" color="textSecondary">
                    Sent by: {notification.sender.name || "Unknown sender"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                  {notification.expiresAt && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ScheduleIcon fontSize="small" />
                      <Typography variant="caption" color="textSecondary">
                        Expires{" "}
                        {formatDistanceToNow(new Date(notification.expiresAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box textAlign="right" sx={{ pr: 3, mb: 2 }}>
              <Button
                size="small"
                onClick={() => onViewReadStatus(notification._id)}
              >
                View Read Status
              </Button>
            </Box>
          </ListItem>
          {idx < notifications.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};
