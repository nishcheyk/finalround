import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useResetPasswordMutation } from "../services/api";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";
import { Alert, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ResetPasswordForm.module.css";

const schema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .matches(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/, "Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character")
    .required("Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

type FormData = yup.InferType<typeof schema>;

/* This code defines a functional component named `ResetPasswordForm` that handles the reset password
functionality in a React application. Here's a breakdown of what the code does: */
export default function ResetPasswordForm({ email }: { email: string }) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await resetPassword({ email, password: data.password }).unwrap();
      toast.success("Password reset successful! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to reset password";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirm = () => {
    setShowConfirm((prev) => !prev);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" mb={2}>
        Set a new password for <strong>{email}</strong>
      </Typography>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("password")}
          label="New Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
          autoFocus
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShowPassword}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register("confirm")}
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          variant="outlined"
          error={!!errors.confirm}
          helperText={errors.confirm?.message}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShowConfirm}
                  edge="end"
                  aria-label="toggle confirm password visibility"
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          className={styles.submitButton}
          fullWidth
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Box>
  );
}
