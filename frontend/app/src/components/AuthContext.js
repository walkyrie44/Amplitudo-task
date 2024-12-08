import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated, getUserRoles, logout } from "../services/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(getUserRoles());

  useEffect(() => {
    setIsAuthenticatedState(isAuthenticated());
    setUserRole(getUserRoles());
  }, []);

  const updateAuth = () => {
    setIsAuthenticatedState(isAuthenticated());
    setUserRole(getUserRoles());
  };

  const logoutUser = () => {
    logout();
    updateAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticatedState,
        userRole,
        updateAuth,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
