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

interface AdminLandingPageProps {
  onSelectNotifications: () => void;
  onSelectUsers: () => void;
}

const AdminLandingPage: React.FC<AdminLandingPageProps> = ({
  onSelectNotifications,
  onSelectUsers,
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
        {/* Add more feature cards */}
      </Grid>
    </Box>
  );
};

export default AdminLandingPage;
