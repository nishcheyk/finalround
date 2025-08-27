import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

import { StatsCards } from "../components/StatsCards";
import { NotificationList } from "../components/NotificationList";
import { NotificationFormDialog } from "../components/NotificationFormDialog";
import ReadStatusDialog from "../components/ReadStatusDialog";

import {
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationStatsQuery,
  useGetAllUsersQuery,
  useGetNotificationReadStatusQuery,
} from "../services/api";

const AdminNotifications: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [openReadStatusId, setOpenReadStatusId] = useState<string | null>(null);

  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    isGlobal: false,
  });

  const { data: notificationsData, isLoading: notificationsLoading } =
    useGetAllNotificationsQuery();
  const { data: statsData, isLoading: statsLoading } =
    useGetNotificationStatsQuery();
  const [createNotification, { isLoading: creating }] =
    useCreateNotificationMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();
  const { data: readStatusData, isLoading: readStatusLoading } =
    useGetNotificationReadStatusQuery(openReadStatusId || "", {
      skip: !openReadStatusId,
    });

  const notifications = notificationsData?.notifications || [];
  const stats = statsData?.stats;

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectedUsersChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = e.target.value;
    setSelectedUsers(
      typeof value === "string" ? value.split(",") : (value as string[])
    );
  };

  const handleSubmit = async () => {
    try {
      await createNotification({
        ...formData,
        recipients: formData.isGlobal ? undefined : selectedUsers,
      }).unwrap();
      setOpenDialog(false);
      setFormData({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        isGlobal: false,
      });
      setSelectedUsers([]);
      alert("Notification created successfully");
    } catch {
      alert("Failed to create notification");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      alert("Notification deleted successfully");
    } catch {
      alert("Failed to delete notification");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <StatsCards stats={stats} loading={statsLoading} />

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Create New Notification
        </Button>
      </Box>

      <NotificationList
        notifications={notifications}
        deleting={deleting}
        onDelete={handleDelete}
        onViewReadStatus={setOpenReadStatusId}
        loading={notificationsLoading}
      />

      <NotificationFormDialog
        open={openDialog}
        loading={creating}
        users={usersData?.users || []}
        usersLoading={usersLoading}
        formData={formData}
        selectedUsers={selectedUsers}
        onFormChange={handleInputChange}
        onSelectedUsersChange={handleSelectedUsersChange}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />

      <ReadStatusDialog
        open={!!openReadStatusId}
        loading={readStatusLoading}
        readUsers={readStatusData?.readUsers || []}
        unreadUsers={readStatusData?.unreadUsers || []}
        onClose={() => setOpenReadStatusId(null)}
      />
    </Box>
  );
};

export default AdminNotifications;
