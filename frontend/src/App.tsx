import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import LottieLoader from "./components/LottieLoader";
import ErrorBoundary from "./components/ErrorBoundary";

const AuthenticatedLayout = lazy(() => import("./layouts/Authenticated"));
const BasicLayout = lazy(() => import("./layouts/Basic"));

const Home = lazy(() => import("./pages/homepage"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const ForgetPasswordPage = lazy(() => import("./pages/ForgetPasswordPage"));

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "90vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LottieLoader />
          </div>
        }
      >
        <Routes>
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/" element={<Home />} />
              {/* other secured routes */}
            </Route>
          </Route>

          {/* Public routes under BasicLayout */}
          <Route element={<BasicLayout />}>
            <Route path="/signup" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
