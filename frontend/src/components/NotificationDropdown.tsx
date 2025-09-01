import React, { useState, useCallback, useMemo } from "react";
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
  Tabs,
  Tab,
  Tooltip,
  Fade,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  MarkEmailRead as MarkReadIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Visibility as ReadIcon,
  CheckCircle,
} from "@mui/icons-material";
import { formatDistanceToNow, isAfter } from "date-fns";
import { toast } from "react-toastify";
import { useAppSelector } from "../store/hooks";
import {
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../services/api";
import { Notification } from "../types/notification";

// Notification type configurations
const notificationConfig = {
  info: { icon: InfoIcon, color: "info" as const },
  warning: { icon: WarningIcon, color: "warning" as const },
  error: { icon: ErrorIcon, color: "error" as const },
  success: { icon: SuccessIcon, color: "success" as const },
  appointment: { icon: ScheduleIcon, color: "primary" as const },
  system: { icon: SettingsIcon, color: "secondary" as const },
} as const;

const priorityConfig = {
  high: { color: "error" as const, label: "High" },
  medium: { color: "warning" as const, label: "Medium" },
  low: { color: "info" as const, label: "Low" },
} as const;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
);

const NotificationDropdown: React.FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  const { user } = useAppSelector((state) => state.auth);

  // API hooks
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetUserNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Memoized filtered notifications
  const { unreadNotifications, readNotifications, expiredNotifications } =
    useMemo(() => {
      const now = new Date();
      const unread: Notification[] = [];
      const read: Notification[] = [];
      const expired: Notification[] = [];

      notifications.forEach((notification) => {
        const isRead = notification.readBy.some(
          (readItem) => readItem.user === user?.id
        );
        const isExpired =
          notification.expiresAt &&
          isAfter(now, new Date(notification.expiresAt));

        if (isExpired) {
          expired.push(notification);
        } else if (isRead) {
          read.push(notification);
        } else {
          unread.push(notification);
        }
      });

      return {
        unreadNotifications: unread,
        readNotifications: read,
        expiredNotifications: expired,
      };
    }, [notifications, user?.id]);

  // Event handlers
  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setActiveTab(0);
  }, []);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        setMarkingAsRead((prev) => new Set(prev).add(notificationId));
        await markAsRead(notificationId).unwrap();
        toast.success("Notification marked as read");
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        toast.error("Failed to mark notification as read");
      } finally {
        setMarkingAsRead((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
      setActiveTab(0); // Switch to "All" tab
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, [markAllAsRead]);

  // Get notification icon and color
  const getNotificationDisplay = useCallback((notification: Notification) => {
    const config =
      notificationConfig[
        notification.type as keyof typeof notificationConfig
      ] || notificationConfig.info;
    const IconComponent = config.icon;

    return {
      icon: <IconComponent sx={{ color: `${config.color}.main` }} />,
      color: config.color,
    };
  }, []);

  // Check if notification is read by current user
  const isNotificationRead = useCallback(
    (notification: Notification) =>
      notification.readBy.some((readItem) => readItem.user === user?.id),
    [user?.id]
  );

  // Get priority chip props
  const getPriorityChip = useCallback((priority: string) => {
    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.low;
    return {
      label: config.label,
      color: config.color,
      size: "small" as const,
    };
  }, []);

  // Notification item component
  const NotificationItem = ({
    notification,
    showActions = true,
  }: {
    notification: Notification;
    showActions?: boolean;
  }) => {
    const isRead = isNotificationRead(notification);
    const isExpired =
      notification.expiresAt &&
      isAfter(new Date(), new Date(notification.expiresAt));
    const isMarking = markingAsRead.has(notification._id);

    const { icon } = getNotificationDisplay(notification);

    return (
      <ListItem
        sx={{
          backgroundColor: isRead
            ? "transparent"
            : alpha(theme.palette.primary.main, 0.1),
          border: isRead
            ? "none"
            : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 1,
          mb: 0.5,
          opacity: isExpired ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: alpha(theme.palette.action.hover, 0.8),
            transform: "translateY(-1px)",
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>

        <ListItemText
          disableTypography
          primary={
            <Box sx={{ mb: 0.5 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={isRead ? 500 : 700}
                  sx={{
                    flex: 1,
                    color: isRead ? "text.secondary" : "text.primary",
                  }}
                >
                  {notification.title}
                </Typography>
                {!isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Chip {...getPriorityChip(notification.priority)} />
                {notification.isGlobal && (
                  <Chip
                    label="Global"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {isExpired && (
                  <Chip
                    label="Expired"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {notification.message}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </Typography>

                {notification.expiresAt && !isExpired && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 12 }} />
                    <Typography variant="caption" color="warning.main">
                      Expires{" "}
                      {formatDistanceToNow(new Date(notification.expiresAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action buttons */}
              {showActions && (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  {!isRead && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        disabled={isMarking}
                        sx={{
                          color: "secondary.main",
                          "&:hover": { backgroundColor: "primary.light" },
                        }}
                      >
                        {isMarking ? (
                          <CircularProgress size={16} />
                        ) : (
                          <ReadIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>
    );
  };

  // Loading skeleton
  const NotificationSkeleton = () => (
    <ListItem>
      <ListItemIcon>
        <Skeleton variant="circular" width={24} height={24} />
      </ListItemIcon>
      <ListItemText
        primary={<Skeleton variant="text" width="80%" height={20} />}
        secondary={
          <Box>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="60%" height={14} />
          </Box>
        }
      />
    </ListItem>
  );

  const EmptyState = ({
    message,
    icon,
  }: {
    message: string;
    icon: React.ReactNode;
  }) => (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        color: "text.secondary",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ fontSize: 48, opacity: 0.5 }}>{icon}</Box>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  const open = Boolean(anchorEl);
  const hasNotifications = notifications.length > 0;

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="large"
          sx={{
            transition: "all 0.2s ease-in-out",
            mx: 4,
            "&.MuiIconButton-sizeLarge": {
              fontSize: 24,
              minWidth: 10,
              minHeight: 48,
            },
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
              transform: "scale(1.05)",
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge-root": {
                minWidth: 20, // ensures enough width
                height: 20,
                px: 0.5, // horizontal padding for 2-3 digits
                fontSize: "0.75rem",
                fontWeight: "bold",
                animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.15)" },
                  "100%": { transform: "scale(1)" },
                },
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsIcon fontSize="inherit" />
            ) : (
              <NotificationsNoneIcon fontSize="inherit" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            width: { xs: 350, sm: 420 },
            maxHeight: 600,
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[12],
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.dark, 0.05)})`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkReadIcon />}
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  sx={{ textTransform: "none" }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>

          {/* Notification Stats */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${unreadCount} Unread`}
              size="small"
              color={unreadCount > 0 ? "primary" : "default"}
              variant={unreadCount > 0 ? "filled" : "outlined"}
            />
            <Chip
              label={`${readNotifications.length} Read`}
              size="small"
              color="default"
              variant="outlined"
            />
            {expiredNotifications.length > 0 && (
              <Chip
                label={`${expiredNotifications.length} Expired`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load notifications
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Box>
            {[...Array(3)].map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </Box>
        ) : !hasNotifications ? (
          <EmptyState
            message="No notifications yet"
            icon={<NotificationsNoneIcon />}
          />
        ) : (
          <>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tab label={`All (${notifications.length})`} />
              <Tab
                label={`Unread (${unreadCount})`}
                sx={{
                  color: unreadCount > 0 ? "primary.main" : "text.secondary",
                }}
              />
              <Tab label={`Read (${readNotifications.length})`} />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {/* All Notifications */}
              <TabPanel value={activeTab} index={0}>
                {notifications.length === 0 ? (
                  <EmptyState
                    message="No notifications"
                    icon={<NotificationsNoneIcon />}
                  />
                ) : (
                  <List sx={{ p: 1 }}>
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                      />
                    ))}
                  </List>
                )}
              </TabPanel>

              {/* Unread Notifications */}
              <TabPanel value={activeTab} index={1}>
                {unreadNotifications.length === 0 ? (
                  <EmptyState
                    message="All caught up! No unread notifications"
                    icon={<CheckCircle />}
                  />
                ) : (
                  <List sx={{ p: 1 }}>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                      />
                    ))}
                  </List>
                )}
              </TabPanel>

              {/* Read Notifications */}
              <TabPanel value={activeTab} index={2}>
                {readNotifications.length === 0 ? (
                  <EmptyState
                    message="No read notifications"
                    icon={<ReadIcon />}
                  />
                ) : (
                  <List sx={{ p: 1 }}>
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        showActions={false}
                      />
                    ))}
                  </List>
                )}
              </TabPanel>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

export default React.memo(NotificationDropdown);
