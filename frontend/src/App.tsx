import React, { lazy, Suspense } from "react";
import {
  Route,
  Routes,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import LottieLoader from "./components/LottieLoader";
import ErrorBoundary from "./components/ErrorBoundary";

// Layouts
const AuthenticatedLayout = lazy(() => import("./layouts/Authenticated"));
const BasicLayout = lazy(() => import("./layouts/Basic"));

// Pages
const Home = lazy(() => import("./pages/homepage"));
const LoginPage = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const ForgetPasswordPage = lazy(() => import("./pages/ForgetPasswordPage"));

// Admin Pages
const AdminLandingPage = lazy(() => import("./pages/AdminLandingPage"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));

// Role & auth protected route component
const RoleProtectedRoute: React.FC<{ requiredAdmin?: boolean }> = ({
  requiredAdmin = false,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredAdmin && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Wrapper component to inject navigation props into AdminLandingPage
const AdminLandingWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLandingPage
      onSelectNotifications={() => navigate("/admin/notifications")}
      onSelectUsers={() => navigate("/admin/users")}
    />
  );
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
          {/* Protected routes for any authenticated user */}
          <Route element={<RoleProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/" element={<Home />} />
              {/* other authenticated routes */}
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<RoleProtectedRoute requiredAdmin />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/admin" element={<AdminLandingWrapper />} />
              <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
              />
              {/* Add other admin feature routes here */}
            </Route>
          </Route>

          {/* Public routes */}
          <Route element={<BasicLayout />}>
            <Route path="/signup" element={<Register />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
