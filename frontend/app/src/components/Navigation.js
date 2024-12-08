import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/ApplicationFormPage";
import AdminPage from "../pages/AdminPage";
import Header from "../components/Header";

const Navigation = () => {
  const { isAuthenticated, userRole, updateAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    } else {
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
        <Route path="/login" element={<LoginPage />} />
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
