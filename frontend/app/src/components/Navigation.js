import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegistrationFormPage";
import DashboardPage from "../pages/ApplicationFormPage";
import AdminPage from "../pages/AdminPage";
import Header from "../components/Header";

const Navigation = () => {
  const { isAuthenticated, userRole, updateAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    updateAuth();
  }, [updateAuth]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === 1 ? (
                <AdminPage />
              ) : (
                <DashboardPage />
              )
            ) : (
              <LoginPage />
            )
          }
        />
      </Routes>
    </>
  );
};

export default Navigation;
