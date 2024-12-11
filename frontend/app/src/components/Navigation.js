import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegistrationFormPage";
import ApplicationForm from "../pages/ApplicationFormPage";
import AdminPage from "../pages/AdminDashboardPage";
import UserProfile from "../pages/UserProfile";
import Header from "../components/Header";

const Navigation = () => {
  const { isAuthenticated, userRole, updateAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const publicPaths = ["/login", "/register"];
    if (!isAuthenticated && !publicPaths.includes(window.location.pathname)) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    updateAuth();
  }, [updateAuth]);

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <ApplicationForm /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === 1 ? (
                <AdminPage />
              ) : (
                <ApplicationForm />
              )
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/profile"
          element={userRole === 2 ? <UserProfile /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default Navigation;
