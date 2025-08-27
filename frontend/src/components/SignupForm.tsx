import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { createStyles } from "@mui/styles";
import { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useRegisterMutation } from "../services/api";
import PasswordInput from "./PasswordInput";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const useStyle = (theme: any) =>
  createStyles({
    root: {
      maxWidth: 400,
      flex: 1,
      mx: "auto",
    },
    input: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    link: {
      color: theme.palette.primary.main,
      cursor: "pointer",
      textDecoration: "none",
    },
  });

type FormData = yup.InferType<typeof validationSchema>;

export default function SignupForm() {
  const theme = useTheme();
  const style = useStyle(theme);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data).unwrap();
      toast.success("User registered successfully!");
      navigate("/login");
    } catch (error: any) {
      const validationError = error?.data?.data?.errors?.[0].msg;
      toast.error(
        validationError ?? error?.data?.message ?? "Something went wrong!"
      );
    }
  };

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card variant="outlined" sx={style.root}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h4" mb={2}>
              <b>Signup</b>
            </Typography>
            <TextField
              {...register("name")}
              label="Name"
              fullWidth
              sx={style.input}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              {...register("email")}
              label="Email"
              fullWidth
              sx={style.input}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              type="email"
            />
            <PasswordInput
              {...register("password")}
              label="Password"
              fullWidth
              sx={style.input}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              type="password"
            />
            <PasswordInput
              {...register("confirmPassword")}
              label="Confirm Password"
              fullWidth
              sx={style.input}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              type="password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={style.button}
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Signing up..." : "Signup"}
            </Button>
            <Typography textAlign="center">
              Already have an account?{" "}
              <NavLink to="/login" style={style.link as CSSProperties}>
                Sign in
              </NavLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
