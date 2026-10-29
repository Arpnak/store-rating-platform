import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first mount, try to restore the session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Re-validate the token with the server
          const response = await authApi.getMe();
          setUser(response.data.user);
        } catch {
          // Token expired or invalid — clear stale data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = { user, isLoading, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook so consumers don't need to import the context object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};
