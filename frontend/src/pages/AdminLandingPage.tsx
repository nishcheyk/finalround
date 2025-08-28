/* This code snippet is a TypeScript React component that defines two components: `FeatureCard` and
`AdminLandingPage`. */
import React from "react";
import { Box, Paper, Typography, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid2"; // This is the new Grid2 component

interface FeatureCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

/* The `const FeatureCard` is a functional component in TypeScript React that takes in props of type
`FeatureCardProps`. It destructures the `title`, `description`, and `onClick` props from the
`FeatureCardProps` object. */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  onClick,
}) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper elevation={3}>
      <CardActionArea onClick={onClick} sx={{ p: 3 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </CardActionArea>
    </Paper>
  </Grid>
);

/* The `interface AdminLandingPageProps` is defining the prop types expected by the `AdminLandingPage`
component in TypeScript React. Each property in this interface represents a function that takes no
arguments and returns `void`. Here's a breakdown of each property: */
interface AdminLandingPageProps {
  onSelectNotifications: () => void;
  onSelectUsers: () => void;
  onSelectStats?: () => void;
  onSelectAppointments?: () => void;
  onSelectServices?: () => void;
}

/* The `const AdminLandingPage` is a functional component in TypeScript React that takes in props of
type `AdminLandingPageProps`. It destructures the props `onSelectNotifications`, `onSelectUsers`,
`onSelectStats`, `onSelectAppointments`, and `onSelectServices` from the `AdminLandingPageProps`
object. */
const AdminLandingPage: React.FC<AdminLandingPageProps> = ({
  onSelectNotifications,
  onSelectUsers,
  onSelectStats,
  onSelectAppointments,
  onSelectServices,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <FeatureCard
          title="Notifications"
          description="Manage notifications for users."
          onClick={onSelectNotifications}
        />
        <FeatureCard
          title="User Management"
          description="Manage users, roles, and permissions."
          onClick={onSelectUsers}
        />
        <FeatureCard
          title="Manage Services"
          description="Add, edit, or remove services."
          onClick={onSelectServices || (() => {})}
        />
        <FeatureCard
          title="View Stats"
          description="View platform statistics and analytics."
          onClick={onSelectStats || (() => {})}
        />
        <FeatureCard
          title="Manage Appointments"
          description="View and manage all appointments."
          onClick={onSelectAppointments || (() => {})}
        />
        {/* Add more feature cards as needed */}
      </Grid>
    </Box>
  );
};

export default AdminLandingPage;
