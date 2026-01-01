import { useEffect, useState } from "react";
import { api } from "../services";

export function useBackend() {
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const checkHealth = async () => {
    try {
      const health = await api.checkHealth();
      setError("");
      setIsRunning(health.status === "healthy");
      return health.status === "healthy";
    } catch (err: any) {
      setError(err);
      setIsRunning(false);
      return false;
    }
  };

  useEffect(() => {
    // Check backend health periodically on mount
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    error,
    isRunning,
    checkHealth,
  };
}
