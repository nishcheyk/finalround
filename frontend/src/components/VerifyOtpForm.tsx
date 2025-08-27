import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useVerifyOtpMutation } from "../services/api";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import { Alert, Box } from "@mui/material";
import styles from "../styles/VerifyOtpForm.module.css";

const schema = yup.object({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function VerifyOtpForm({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

 /**
  * The onSubmit function handles OTP verification and displays success or error messages accordingly.
  * @param {FormData} data - The `data` parameter in the `onSubmit` function is of type `FormData`. It
  * likely contains information submitted by the user, such as the OTP (One-Time Password) entered in a
  * form.
  */
  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await verifyOtp({ email, otp: data.otp }).unwrap();
      toast.success("OTP verified successfully!");
      onVerified();
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Invalid or expired OTP";
      setError(errorMessage);
      setAttempts(prev => prev + 1);
      toast.error(errorMessage);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter the 6-digit OTP sent to <strong>{email}</strong>
      </Typography>
      
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("otp")}
          label="Enter OTP"
          variant="outlined"
          error={!!errors.otp}
          helperText={errors.otp?.message}
          fullWidth
          inputProps={{ maxLength: 6 }}
          autoFocus
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          className={styles.submitButton}
          fullWidth
        >
          {isLoading ? "Verifying OTP..." : "Verify OTP"}
        </Button>
        
        {attempts > 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Attempts: {attempts}/5
          </Typography>
        )}
      </form>
    </Box>
  );
}
