import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/hooks';
import {
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../services/api';
import { Notification } from '../types/notification';

const NotificationDropdown: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const { data: notificationsData, isLoading, error } = useGetUserNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);
      await markAsRead(notificationId).unwrap();
      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <InfoIcon color="info" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'success': return <SuccessIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const isNotificationRead = (notification: Notification) =>
    notification.readBy.some((read) => read.user === user?.id);

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} size="large" sx={{ position: 'relative' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 400, maxHeight: 500, mt: 1 } }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead} disabled={isLoading}>
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }}>Failed to load notifications</Alert>}

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    backgroundColor: isNotificationRead(notification) ? 'transparent' : 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' },
                  }}
                >
                  <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>

                  <ListItemText
                    disableTypography
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight="bold" component="span">
                          {notification.title}
                        </Typography>
                        <Chip label={notification.priority} size="small" color={getPriorityColor(notification.priority) as any} />
                        {notification.isGlobal && <Chip label="Global" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {notification.message}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Typography variant="caption" color="text.secondary" component="span">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                          {notification.expiresAt && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ScheduleIcon fontSize="small" />
                              <Typography variant="caption" color="text.secondary" component="span">
                                Expires {formatDistanceToNow(new Date(notification.expiresAt), { addSuffix: true })}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    }
                  />

                  {!isNotificationRead(notification) && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={markingAsRead === notification._id}
                    >
                      {markingAsRead === notification._id ? <CircularProgress size={16} /> : 'Mark as read'}
                    </Button>
                  )}
                </ListItem>

                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationDropdown;
