import LoginForm from "../components/LoginForm";
import React from "react";

export default function LoginPage() {
  // Implement or use the error/loading state here as needed
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  return (
    <LoginForm
      error={error}
      handleError={setError}
      clearError={() => setError(null)}
      isLoading={loading}
      setLoading={setLoading}
    />
  );
}
