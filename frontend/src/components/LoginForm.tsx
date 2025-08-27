import React from "react";
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";

import { useLoginMutation } from "../services/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/reducers/authReducer";
import { ThemeSelector } from "./ThemeSelector";
import { withErrorHandling, withLoading } from "./hocs";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .matches(
      /^(?=.*[a-z])/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /^(?=.*[A-Z])/,
      "Password must contain at least one uppercase letter"
    )
    .matches(/^(?=.*\d)/, "Password must contain at least one number")
    .matches(
      /^(?=.*[@$!%*?&])/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

interface LoginFormProps {
  // Props from withErrorHandling HOC
  error?: string | null;
  handleError: (message: string) => void;
  clearError: () => void;

  // Props from withLoading HOC
  isLoading?: boolean;
  setLoading: (loading: boolean) => void;
}

function LoginFormComponent({
  error,
  handleError,
  clearError,
  isLoading,
  setLoading,
}: LoginFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Sync loading states
  React.useEffect(() => {
    setLoading(isLoginLoading);
  }, [isLoginLoading, setLoading]);

  const onSubmit = async (data: FormData) => {
    try {
      clearError(); // Clear any previous errors
      const result = await loginUser(data).unwrap();
      dispatch(
        setCredentials({
          accessToken: result.token,
          refreshToken: "", // Refresh token is now handled via httpOnly cookies
          user: result.user,
        })
      );
      toast.success("User logged in successfully!");
      navigate("/", { replace: true });
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.errors?.[0]?.message ||
        "Login failed";
      handleError(errorMessage); // Use HOC error handling
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="background.default"
      p={2}
      position="relative"
    >
      {/* Theme Selector */}
      <Box position="absolute" top={16} right={16}>
        <ThemeSelector />
      </Box>

      <Card
        variant="outlined"
        sx={{
          maxWidth: 420,
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: mode === "dark" ? 8 : 6,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          textAlign="center"
        >
          Welcome Back!
        </Typography>
        <Typography
          variant="body1"
          mb={4}
          textAlign="center"
          color="text.secondary"
        >
          Sign in to continue to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            {...register("email")}
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            variant="outlined"
            autoFocus
          />

          <TextField
            {...register("password")}
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={!isValid || isLoading}
            startIcon={<LoginIcon />}
            sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.5 }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <NavLink
              to="/signup"
              style={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign up
            </NavLink>
          </Typography>

          <Typography variant="body2" mt={1}>
            <NavLink
              to="/forget-password"
              style={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Forgot your password?
            </NavLink>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

// Apply HOCs to enhance the component
const LoginForm = withErrorHandling(
  withLoading(LoginFormComponent, {
    fullScreen: false,
    showSpinner: false,
    message: "Logging in...",
  }),
  {
    showErrorBoundary: true,
    position: "top",
    autoHideDuration: 5000,
  }
);

export default LoginForm;
