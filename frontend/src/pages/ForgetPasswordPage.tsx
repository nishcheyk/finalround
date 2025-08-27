import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import RequestOtpForm from "../components/RequestOtpForm";
import VerifyOtpForm from "../components/VerifyOtpForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import LottieLoader from "../components/LottieLoader";

const steps = ["Request OTP", "Verify OTP", "Reset Password"];

export default function ForgetPasswordPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const onRequestOtpNext = (email: string) => {
    setEmail(email);
    handleNext();
  };

  const onVerifyOtpSuccess = () => {
    handleNext();
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return loading ? (
          <LottieLoader />
        ) : (
          <RequestOtpForm onNext={onRequestOtpNext} setLoading={setLoading} />
        );
      case 1:
        return <VerifyOtpForm email={email} onVerified={onVerifyOtpSuccess} />;
      case 2:
        return <ResetPasswordForm email={email} />;
      default:
        return null;
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 500,
        margin: "auto",
        mt: 36,
        p: 4,
        borderRadius: 3,
        boxShadow: 6,
      }}
    >
      <CardContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            <Button
              onClick={handleBackToLogin}
              variant="text"
              color="primary"
            >
              Back to Login
            </Button>

            {activeStep === steps.length - 1 ? (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ alignSelf: "center" }}
              >
                Complete the form and submit to reset your password.
              </Typography>
            ) : (
              <Button onClick={handleNext} variant="contained" disabled>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
