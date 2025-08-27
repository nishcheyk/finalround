import React, { useState } from "react";
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
} from "@mui/material";
import { ListItemButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { resetCredentials } from "../store/reducers/authReducer";
import { ColorThemeSwitcher } from "../components/ThemeSelector";

export default function Authenticated() {
  const { isAuthenticated, user, refreshToken } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logoutUser, { isLoading }] = useLogoutMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  const handleLogout = async () => {
    handleMenuClose();
    setDrawerOpen(false);
    try {
      if (!refreshToken) {
        dispatch(resetCredentials());
        navigate("/login", { replace: true });
        return;
      }
      await logoutUser({ refreshToken }).unwrap();
      dispatch(resetCredentials());
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed", e);
      dispatch(resetCredentials());
      navigate("/login", { replace: true });
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const menuId = "primary-account-menu";

  const drawerList = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 250 }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/profile">
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        {user?.isAdmin && (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/admin">
              <ListItemText primary="Admin Panel" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <ListItemText primary="Logout" />
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
            <Typography variant="h5" noWrap>
              App Logo
            </Typography>
            {user && (
              <Typography variant="subtitle2" noWrap>
                Welcome, {user.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mr: 2 }}>
            <ColorThemeSwitcher />
          </Box>

          {!isMobile && (
            <>
              <Tooltip title={user?.email || ""}>
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
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                id={menuId}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleMenuClose}
                >
                  Profile
                </MenuItem>
                {user?.isAdmin && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleMenuClose}
                  >
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={20} /> : "Logout"}
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  );
}
