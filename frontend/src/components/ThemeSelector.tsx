import React, { useState, useCallback, memo } from "react";
import {
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Paper,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setMode, ThemeMode } from "../store/themeSlice";

// Theme configuration with icons and labels
const themeConfig = {
  light: {
    icon: LightModeIcon,
    label: "Light",
    description: "Light theme",
    color: "#FFA726",
  },
  dark: {
    icon: DarkModeIcon,
    label: "Dark",
    description: "Dark theme",
    color: "#5C6BC0",
  },
  system: {
    icon: SystemIcon,
    label: "System",
    description: "Follow system preference",
    color: "#26A69A",
  },
} as const;

export const ColorThemeSwitcher: React.FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();

  const open = Boolean(anchorEl);

  // Event handlers
  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const changeTheme = useCallback(
    (newMode: ThemeMode) => {
      dispatch(setMode(newMode));
      handleClose();
    },
    [dispatch]
  );

  // Get current theme config
  const currentThemeConfig = themeConfig[mode];
  const CurrentThemeIcon = currentThemeConfig.icon;

  return (
    <>
      <Tooltip title="Change theme" arrow>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="large"
          aria-label="theme switcher"
          aria-haspopup="true"
          aria-expanded={open}
          sx={{
            transition: "all 0.2s ease-in-out",
            p: 1,
            mx: 0.5,
            height: 40,
            "&mui-IconButton-root": { display: "none" },
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <CurrentThemeIcon
            sx={{
              fontSize: 34,
              color: currentThemeConfig.color,
              transition: "all 0.2s ease-in-out",
              transform: "scale(1.1)",
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))",
            }}
          />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        TransitionComponent={Fade}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`
                  : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.grey[50], 0.98)})`,
              backdropFilter: "blur(10px)",
            },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PaletteIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Choose Theme
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select your preferred appearance
          </Typography>
        </Box>

        {/* Theme Options */}
        <List sx={{ p: 1 }}>
          {(Object.keys(themeConfig) as ThemeMode[]).map((themeMode) => {
            const config = themeConfig[themeMode];
            const ThemeIcon = config.icon;
            const isSelected = mode === themeMode;

            return (
              <ListItem key={themeMode} disablePadding>
                <ListItemButton
                  onClick={() => changeTheme(themeMode)}
                  selected={isSelected}
                  sx={{
                    borderRadius: 1.5,
                    mx: 0.5,
                    mb: 0.5,
                    transition: "all 0.2s ease-in-out",
                    "&.Mui-selected": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.action.hover, 0.8),
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ThemeIcon
                      sx={{
                        color: isSelected ? config.color : "text.secondary",
                        fontSize: 20,
                        transition: "all 0.2s ease-in-out",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight={isSelected ? 600 : 500}
                        sx={{
                          color: isSelected ? "primary.main" : "text.primary",
                          transition: "color 0.2s ease-in-out",
                        }}
                      >
                        {config.label}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? "primary.dark" : "text.secondary",
                          opacity: isSelected ? 0.8 : 0.7,
                        }}
                      >
                        {config.description}
                      </Typography>
                    }
                  />

                  {/* Selection indicator */}
                  {isSelected && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: config.color,
                        boxShadow: `0 0 0 2px ${alpha(config.color, 0.3)}`,
                        animation: "glow 2s ease-in-out infinite alternate",
                        "@keyframes glow": {
                          from: {
                            boxShadow: `0 0 0 2px ${alpha(config.color, 0.3)}`,
                          },
                          to: {
                            boxShadow: `0 0 0 4px ${alpha(config.color, 0.1)}`,
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center" }}
          >
            Current: <strong>{currentThemeConfig.label}</strong>
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

// Memoized version for performance
const ThemeSelector = memo(ColorThemeSwitcher);
ThemeSelector.displayName = "ThemeSelector";

export { ThemeSelector };
