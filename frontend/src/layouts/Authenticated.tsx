/* The above code is a TypeScript React component for an authenticated layout. It includes a navigation
bar (AppBar) with various features such as user profile display, menu options, theme switcher,
notifications dropdown, and a responsive drawer for mobile devices. */
import React, { useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Badge,
  Chip,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import {
  Link as RouterLink,
  Link,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { resetCredentials } from "../store/reducers/authReducer";
import { ColorThemeSwitcher } from "../components/ThemeSelector";
import NotificationDropdown from "../components/NotificationDropdown";

export default function AuthenticatedLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logoutUser, { isLoading }] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  const handleLogout = useCallback(async () => {
    handleMenuClose();
    setDrawerOpen(false);
    try {
      await logoutUser().unwrap();
      dispatch(resetCredentials());
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed", e);
      dispatch(resetCredentials());
      navigate("/login", { replace: true });
    }
  }, [logoutUser, dispatch, navigate]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const menuId = "primary-account-menu";

  const drawerList = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 250 }}
    >
      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            {user?.isAdmin && (
              <Chip
                label="Admin"
                size="small"
                color="primary"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/profile">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>

        {user?.isAdmin && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/admin">
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        <Divider />

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </>
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer(true)}
                aria-label="open drawer"
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawerList}
              </Drawer>
            </>
          ) : (
            <Box sx={{ width: 48, mr: 2 }} />
          )}

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
          >
            <Typography variant="h5" noWrap fontWeight="bold">
              🚀 App Name
            </Typography>
            {user && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" color="text.secondary">
                  Welcome back,
                </Typography>
                <Typography variant="subtitle2" noWrap fontWeight="bold">
                  {user.name}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mr: 2 }}>
            <ColorThemeSwitcher />
          </Box>

          {/* Notifications Icon with dropdown */}
          <NotificationDropdown />

          {!isMobile && (
            <>
              <Tooltip title={`${user?.name || "User"} (${user?.email || ""})`}>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl)}
                  onClick={handleMenuOpen}
                  color="inherit"
                  size="large"
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                closeAfterTransition={false}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 200,
                      mt: 1,
                      boxShadow: 3,
                    },
                  },
                }}
              >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {user?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>

                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleMenuClose}
                >
                  <PersonIcon sx={{ mr: 2 }} />
                  Profile
                </MenuItem>

                <MenuItem
                  component={Link}
                  to="/settings"
                  onClick={handleMenuClose}
                >
                  <SettingsIcon sx={{ mr: 2 }} />
                  Settings
                </MenuItem>

                {user?.isAdmin && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleMenuClose}
                  >
                    <AdminPanelSettingsIcon sx={{ mr: 2 }} />
                    Admin Panel
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <AccountCircle sx={{ mr: 2 }} />
                      Logout
                    </>
                  )}
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleMenuOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }
}
