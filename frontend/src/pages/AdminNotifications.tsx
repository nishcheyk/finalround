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

/* The `import` statement in the code snippet is importing various custom hooks from the
"../services/api" file. These custom hooks are likely part of a data fetching library or service
that interacts with an API to perform specific tasks related to notifications and user data in the
application. */
import {
  useGetAllNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationStatsQuery,
  useGetAllUsersQuery,
  useGetNotificationReadStatusQuery,
} from "../services/api";

/* The `AdminNotifications` component in the provided code snippet is a functional component in a
TypeScript React application. Here is a breakdown of what the component is doing: */
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

 /**
  * The function `handleInputChange` updates a specific field in a form data object in a TypeScript
  * React component.
  * @param {K} field - The `field` parameter represents the key of the `formData` object that you want
  * to update.
  * @param value - The `value` parameter in the `handleInputChange` function represents the new value
  * that you want to set for a specific field in the `formData` object. It should be of the same type
  * as the field it corresponds to in the `formData` object.
  */
  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

/**
 * The function `handleSelectedUsersChange` updates the selected users based on the value of a React
 * change event.
 * @param e - The parameter `e` is of type `React.ChangeEvent` which represents an event that occurs
 * when the value of an input element changes. In this case, it specifically has a property `value` of
 * type `unknown`, which means the value can be of any type.
 */
  const handleSelectedUsersChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = e.target.value;
    setSelectedUsers(
      typeof value === "string" ? value.split(",") : (value as string[])
    );
  };

/**
 * The `handleSubmit` function creates a notification with the provided form data and selected users,
 * handling success and failure cases with alerts.
 */
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

  /**
   * The function `handleDelete` deletes a notification by calling an asynchronous function
   * `deleteNotification` and displays an alert message based on the outcome.
   * @param {string} notificationId - The `notificationId` parameter is a string that represents the
   * unique identifier of the notification that needs to be deleted.
   */
  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      alert("Notification deleted successfully");
    } catch {
      alert("Failed to delete notification");
    }
  };

 /* The `return` statement in the `AdminNotifications` component is rendering the JSX elements that
 make up the admin dashboard interface. Here's a breakdown of what each component or element is
 responsible for: */
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
