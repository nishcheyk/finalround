import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import {
  orange,
  grey,
  blueGrey,
  deepPurple,
  teal,
  amber,
  red,
} from "@mui/material/colors";

const getTheme = (mode: "light" | "dark" | "system") => {
  // Resolve system theme to light/dark
  let currentMode = mode;
  if (mode === "system" && typeof window !== "undefined" && window.matchMedia) {
    currentMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  const isLight = currentMode === "light";

  let theme = createTheme({
    palette: {
      mode: currentMode, // only 'light' or 'dark' allowed here
      primary: {
        main: isLight ? "#1976d2" : deepPurple[300],
        light: isLight ? "#42a5f5" : deepPurple[100],
        dark: isLight ? "#115293" : deepPurple[700],
      },
      secondary: {
        main: isLight ? orange[500] : teal[300],
        light: isLight ? "#ffc947" : teal[100],
        dark: isLight ? "#b26a00" : teal[700],
        contrastText: "#fff",
      },
      error: {
        main: red[700],
      },
      warning: {
        main: amber[700],
      },
      background: {
        default: isLight ? "#f5f5f5" : "#121212",
        paper: isLight ? "#fff" : "#1d1d1d",
      },
      text: {
        primary: isLight ? grey[900] : "#fff",
        secondary: isLight ? grey[700] : grey[400],
      },
      divider: isLight ? blueGrey[200] : grey[600],
      action: {
        active: isLight ? grey[600] : grey[300],
        hover: isLight
          ? "rgba(25, 118, 210, 0.08)"
          : "rgba(144, 202, 249, 0.15)",
        selected: isLight
          ? "rgba(25, 118, 210, 0.14)"
          : "rgba(144, 202, 249, 0.25)",
        disabled: isLight ? grey[400] : grey[400],
        disabledBackground: isLight ? grey[50] : grey[900],
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontSize: "2.75rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2.25rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: "1.15rem",
        fontWeight: 500,
        color: isLight ? grey[700] : grey[400],
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
      caption: {
        fontSize: "0.8rem",
        color: isLight ? grey[600] : grey[500],
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #2a2a2a inset !important;
            -webkit-text-fill-color: #fff !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `,
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? "#fff" : "#2a2a2a",
            "&.Mui-focused fieldset": {
              borderColor: isLight ? undefined : "#90caf9",
            },
            "&.Mui-error fieldset": {
              borderColor: isLight ? undefined : "rgba(255, 82, 82, 0.8)",
            },
          },
          input: {
            backgroundColor: isLight ? "#fff" : "#2a2a2a",
            color: isLight ? undefined : "#fff",
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color:
              currentMode === "light" ? undefined : "rgba(255, 82, 82, 0.8)",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: currentMode === "light" ? undefined : "#bbb",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            boxShadow:
              "0 3px 5px -1px rgba(25, 118, 210, 0.2), 0 5px 8px 0 rgba(25, 118, 210, 0.14), 0 1px 14px 0 rgba(25, 118, 210, 0.12)",
          },
          containedPrimary: {
            background: isLight
              ? "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)"
              : "linear-gradient(45deg, #673ab7 30%, #9575cd 90%)",
            color: "#fff",
            "&:hover": {
              background: isLight
                ? "linear-gradient(45deg, #115293 30%, #1976d2 90%)"
                : "linear-gradient(45deg, #512da8 30%, #673ab7 90%)",
              boxShadow: isLight
                ? "0 4px 5px rgba(21, 101, 192, 0.4)"
                : "0 4px 5px rgba(81, 45, 168, 0.5)",
              color: "#fff",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: isLight ? "#1976d2" : "#673ab7",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? "#fafafa" : "#212121",
            width: 280,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: "0.9rem",
            borderRadius: 8,
          },
        },
      },
    },
    spacing: 8,
  });

  return responsiveFontSizes(theme);
};

export default getTheme;
