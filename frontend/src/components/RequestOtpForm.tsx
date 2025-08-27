import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSendOtpMutation } from "../services/api";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import { Alert, Box, Typography } from "@mui/material";
import styles from "../styles/RequestOtpForm.module.css";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function RequestOtpForm({
  onNext,
  setLoading,
}: {
  onNext: (email: string) => void;
  setLoading: (loading: boolean) => void;
}) {
  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await sendOtp({ email: data.email }).unwrap();
      toast.success("OTP sent to your email!");
      onNext(data.email);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to send OTP";
      setError(errorMessage);
      
      // Handle 429 rate limit error
      if (error?.status === 429) {
        const waitTime = parseInt(errorMessage.match(/(\d+)/)?.[1] || "60");
        setCountdown(waitTime);
        toast.error(`Too many requests. Please wait ${waitTime} seconds before trying again.`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("email")}
          label="Email"
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          autoComplete="email"
          disabled={isLoading || countdown > 0}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || countdown > 0}
          className={styles.submitButton}
          fullWidth
        >
          {isLoading 
            ? "Sending OTP..." 
            : countdown > 0 
              ? `Wait ${countdown}s` 
              : "Send OTP"
          }
        </Button>
        
        {countdown > 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Rate limit exceeded. Please wait before requesting another OTP.
          </Typography>
        )}
      </form>
    </Box>
  );
}
