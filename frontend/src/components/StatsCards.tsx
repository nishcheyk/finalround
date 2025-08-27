import React from "react";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface StatsCardsProps {
  stats?: { total?: number; global?: number; today?: number };
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => (
  <Grid container spacing={3} sx={{ mb: 4 }}>
    {[
      "Total Notifications",
      "Global Notifications",
      "Today's Notifications",
    ].map((label, i) => {
      const values = [stats?.total, stats?.global, stats?.today];
      return (
        <Grid key={label} size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {label}
              </Typography>
              <Typography variant="h4">
                {loading ? <CircularProgress size={24} /> : (values[i] ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);
