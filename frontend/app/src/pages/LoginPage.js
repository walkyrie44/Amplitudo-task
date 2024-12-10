import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { login, googleLogin } from "../services/auth";
import { AuthContext } from "../components/AuthContext";
import AlertMessage from "../components/AlertMessage";
import logo from "../assets/images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [alertData, setAlertData] = useState({});
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { updateAuth } = useContext(AuthContext);


  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const validateFields = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    } 

    try {
      await login(email, password);
      updateAuth();
    } catch (err) {
      setAlertData({
        message: "Unable to login, check your email and password.",
        alertType: "dismiss",
      });
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      await googleLogin(response.credential);
      updateAuth();
    } catch (err) {
      setAlertData({
        message: "Unable to login via google account, try again later.",
        alertType: "dismiss",
      });
    }
  };

  const handleClose = () => {
    setAlertData({ message: "", alertType: "" });
  };

  return (
    <>
      <AlertMessage
        message={alertData.message}
        alertType={alertData.alertType}
        onClose={handleClose}
      />
      <GoogleOAuthProvider clientId="486402589132-s1pkpi6jaobl36nfeu55mcv3f468v1q8.apps.googleusercontent.com">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src={logo}
              className="mx-auto h-14 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                  />
                  {emailError && (
                    <p className="text-sm text-red-500 mt-1">{emailError}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            {/* Link for users who need to register */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Google login button */}
            <div className="mt-6">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() =>
                  setAlertData({
                    message: "Unable to login, check your email and password.",
                    alertType: "dismiss",
                  })
                }
                useOneTap
                className="w-full bg-white text-black font-semibold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </>
  );
}
