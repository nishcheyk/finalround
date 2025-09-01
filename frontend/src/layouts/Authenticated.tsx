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
  Badge,
  Chip,
} from "@mui/material";
import {
  Link as RouterLink,
  NavLink,
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import LogoutIcon from "@mui/icons-material/Logout";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CloseIcon from "@mui/icons-material/Close";

import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { resetCredentials } from "../store/reducers/authReducer";
import { ColorThemeSwitcher } from "../components/ThemeSelector";
import NotificationDropdown from "../components/NotificationDropdown";

// Navigation items configuration
const navigationItems = [
  { path: "/", label: "Book Appointment", icon: BookOnlineIcon },
  { path: "/my-appointments", label: "My Schedule", icon: CalendarTodayIcon },
];

const adminNavigationItems = [
  { path: "/admin", label: "Admin Panel", icon: AdminPanelSettingsIcon },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: NotificationsIcon,
  },
  { path: "/admin/users", label: "Manage Users", icon: SupervisorAccountIcon },
];

/**
 * Enhanced AuthenticatedLayout component with improved UI/UX and bug fixes
 */
export default function AuthenticatedLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle drawer toggle
  const toggleDrawer = useCallback(
    (open: boolean) => () => {
      setDrawerOpen(open);
    },
    []
  );

  // Handle logout with error handling
  const handleLogout = useCallback(async () => {
    handleMenuClose();
    setDrawerOpen(false);

    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(resetCredentials());
      navigate("/login", { replace: true });
    }
  }, [logoutUser, dispatch, navigate]);

  // Handle menu operations
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Check if current path is active
  const isPathActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }, [user?.name]);

  // Navigation button component
  const NavigationButton = ({
    path,
    label,
    isActive,
  }: {
    path: string;
    label: string;
    isActive: boolean;
  }) => (
    <Button
      component={NavLink}
      to={path}
      color="inherit"
      variant={isActive ? "contained" : "outlined"}
      size={isTablet ? "medium" : "large"}
      sx={{
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "none",
        backgroundColor: isActive ? "secondary.main" : "transparent",
        color: isActive ? "white" : "inherit",
        borderColor: isActive ? "secondary.main" : "rgba(255,255,255,0.3)",
        "&:hover": {
          backgroundColor: isActive
            ? "secondary.dark"
            : "rgba(255,255,255,0.1)",
          borderColor: isActive ? "secondary.dark" : "rgba(255,255,255,0.5)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
        whiteSpace: "nowrap",
        minWidth: isTablet ? 100 : 120,
        borderRadius: 2,
        px: isTablet ? 2 : 3,
      }}
    >
      {label}
    </Button>
  );

  // Mobile drawer content
  const DrawerContent = () => (
    <Box sx={{ width: 280, height: "100%" }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            75 WAYS
          </Typography>
          <IconButton
            onClick={toggleDrawer(false)}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}
          >
            {getUserInitials()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {user?.name || "User"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
              {user?.email}
            </Typography>
            {user?.isAdmin && (
              <Chip
                label="Admin"
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ pt: 2 }}>
        {navigationItems.map(({ path, label, icon: Icon }) => {
          const isActive = isPathActive(path);
          return (
            <ListItem key={path} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? "inherit" : "text.secondary" }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Admin Section */}
        {user?.isAdmin && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <ListItem sx={{ px: 2 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
              >
                Administration
              </Typography>
            </ListItem>
            {adminNavigationItems.map(({ path, label, icon: Icon }) => {
              const isActive = isPathActive(path);
              return (
                <ListItem key={path} disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={path}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.secondary.light,
                        color: theme.palette.secondary.contrastText,
                        "&:hover": {
                          backgroundColor: theme.palette.secondary.main,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ color: isActive ? "inherit" : "text.secondary" }}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </>
        )}

        {/* User Actions */}
        <Divider sx={{ my: 2, mx: 2 }} />
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/settings"
            sx={{ borderRadius: 2, mx: 1 }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
                color: "error.contrastText",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              {isLoggingOut ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <LogoutIcon />
              )}
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 70, sm: 80, md: 90 },
            px: { xs: 2, sm: 3, md: 4 },
            gap: 2,
          }}
        >
          {/* Left Section - Menu/Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer(true)}
                aria-label="open navigation menu"
                size="large"
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
              sx={{
                background: "linear-gradient(45deg, #fff, #f0f0f0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              75 WAYS Technologies
            </Typography>
          </Box>

          {/* Center Section - Navigation (Desktop) */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexGrow: 1,
                maxWidth: 700,
              }}
            >
              {navigationItems.map(({ path, label }) => (
                <NavigationButton
                  key={path}
                  path={path}
                  label={label}
                  isActive={isPathActive(path)}
                />
              ))}

              {user?.isAdmin && (
                <NavigationButton
                  path="/admin"
                  label="Admin"
                  isActive={isPathActive("/admin")}
                />
              )}
            </Box>
          )}

          {/* Right Section - User Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Welcome message for larger screens */}
            {!isMobile && user && (
              <Box sx={{ textAlign: "right", mr: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Welcome back,
                </Typography>
                <Typography variant="h6" fontWeight="600" noWrap>
                  {user.name}
                </Typography>
              </Box>
            )}

            {/* Theme Switcher */}
            <ColorThemeSwitcher />

            {/* Notifications */}

            <NotificationDropdown />

            {/* User Menu (Desktop) */}
            {!isMobile && user && (
              <>
                <Tooltip title={`${user.name} (${user.email})`} arrow>
                  <IconButton
                    edge="end"
                    aria-label="account menu"
                    aria-controls="user-account-menu"
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                    onClick={handleMenuOpen}
                    color="inherit"
                    size="large"
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "secondary.main",
                        fontWeight: "bold",
                        border: "2px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* User Menu Dropdown */}
                <Menu
                  id="user-account-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: {
                      sx: {
                        minWidth: 220,
                        mt: 1.5,
                        boxShadow: theme.shadows[8],
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                      },
                    },
                  }}
                >
                  {/* User Info Header */}
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 40, height: 40 }}
                      >
                        {getUserInitials()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          noWrap
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {user.email}
                        </Typography>
                        {user.isAdmin && (
                          <Chip
                            label="Administrator"
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5, fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Menu Items */}
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <PersonIcon sx={{ mr: 2, color: "text.secondary" }} />
                    <Typography variant="body1">Profile</Typography>
                  </MenuItem>

                  <MenuItem
                    component={Link}
                    to="/settings"
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <SettingsIcon sx={{ mr: 2, color: "text.secondary" }} />
                    <Typography variant="body1">Settings</Typography>
                  </MenuItem>

                  {/* Admin Menu Items */}
                  {user.isAdmin && (
                    <>
                      <Divider />
                      {adminNavigationItems.map(
                        ({ path, label, icon: Icon }) => (
                          <MenuItem
                            key={path}
                            component={Link}
                            to={path}
                            onClick={handleMenuClose}
                            sx={{ py: 1.5 }}
                          >
                            <Icon sx={{ mr: 2, color: "secondary.main" }} />
                            <Typography variant="body1">{label}</Typography>
                          </MenuItem>
                        )
                      )}
                    </>
                  )}

                  <Divider />

                  {/* Logout */}
                  <MenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    sx={{
                      py: 1.5,
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    {isLoggingOut ? (
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                    ) : (
                      <LogoutIcon sx={{ mr: 2 }} />
                    )}
                    <Typography variant="body1">
                      {isLoggingOut ? "Signing out..." : "Logout"}
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundImage: "none",
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "calc(100vh - 90px)",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}
