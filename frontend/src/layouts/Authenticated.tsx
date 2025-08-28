import React, { useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Link as RouterLink,
  NavLink,
  Link,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsIcon from "@mui/icons-material/Notifications";

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

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleMenuOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  const drawerList = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 250 }}
    >
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
              <Button
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                Admin
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Booking" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/my-appointments">
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="My Schedule" />
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
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/admin/notifications">
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Notifications" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/admin/users">
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Users" />
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
                <AccountCircle />
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
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side hamburger menu on mobile */}
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              aria-label="open drawer"
              size="large"
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 48 }} />
          )}

          {/* Left side company name and welcome */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "white",
              flexGrow: 1,
              px: 2,
              gap: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
              75 WAYS technologies
            </Typography>
            {user && (
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Welcome back,
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {user.name}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Center navbar buttons with active highlight */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              flexGrow: 1,
              maxWidth: 400,
            }}
          >
            {["/book", "/my-appointments"].map((path, index) => {
              const label = index === 0 ? "Booking" : "My Schedule";
              return (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  color="inherit"
                  variant="outlined"
                  size="large"
                  sx={({ isActive }) => ({
                    fontWeight: "bold",
                    letterSpacing: 0.5,
                    backgroundColor: isActive
                      ? "secondary.main"
                      : "transparent",
                    color: isActive ? "white" : "inherit",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "secondary.dark"
                        : "rgba(255,255,255,0.1)",
                    },
                  })}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          {/* Right side user profile, theme switcher, notifications */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ColorThemeSwitcher />
            <NotificationDropdown />
            {!isMobile && (
              <>
                <Tooltip
                  title={`${user?.name || "User"} (${user?.email || ""})`}
                >
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
                  {user?.isAdmin && (
                    <>
                      <MenuItem
                        component={Link}
                        to="/admin/notifications"
                        onClick={handleMenuClose}
                      >
                        <NotificationsIcon sx={{ mr: 2 }} />
                        Admin Notifications
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/admin/users"
                        onClick={handleMenuClose}
                      >
                        <PersonIcon sx={{ mr: 2 }} />
                        Admin Users
                      </MenuItem>
                    </>
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerList}
        </Drawer>
      )}

      <Outlet />
    </>
  );
}
