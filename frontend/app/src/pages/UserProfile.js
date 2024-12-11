import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { updateUserProfile, getUserProfile } from "../services/users";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";

export default function UserProfile() {
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({
    full_name: "",
    password: "",
    confirm_password: "",
    photo: "",
  });
  const [formData, setFormData] = useState({
    full_name: "",
    password: "",
    confirm_password: "",
    photo: "",
  });
  const [originalData, setOriginalData] = useState({
    full_name: "",
    password: "",
    confirm_password: "",
    photo: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile();
        if (response) {
          const initialData = {
            full_name: response.full_name,
            password: "",
            confirm_password: "",
            photo: response.photo || "",
          };

          setOriginalData(initialData);
          setFormData(initialData);
        }
      } catch (error) {
        setAlertData({
          message: "Failed to update profile. Please try again.",
          alertType: "dismiss",
        });
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (value && updatedErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
        setAlertData({
          message: "One or more files exceed the size limit of 10 MB.",
          alertType: "dismiss",
        });
        return;
      }

    if (file) {
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result.split(",")[1],
        });
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    const isUnchanged = JSON.stringify(formData) === JSON.stringify(originalData);
    if (isUnchanged) {
      setAlertData({
        message: "You must make at least one change to submit the form.",
        alertType: "dismiss",
      });
      return false;
    }

    if (formData.password && formData.password !== formData.confirm_password) {
      errors.password = "Passwords do not match";
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      await updateUserProfile(formData);
      setAlertData({
        message: "Profile updated successfully",
        alertType: "success",
      });
    } catch (error) {
      setAlertData({
        message: "Failed to update profile. Please try again.",
        alertType: "dismiss",
      });
    } finally {
      setLoading(false);
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
      <LoadingSpinner loading={loading} />
      <form className="max-w-3xl mx-auto p-6 space-y-8" onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Edit Profile
        </h2>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-gray-900"
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
              />
              {formErrors.full_name && (
                <p className="mt-2 text-sm text-red-600">
                  {formErrors.full_name}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
              />
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-900"
              >
                Confirm New Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password || ""}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
              />
              {formErrors.confirm_password && (
                <p className="mt-2 text-sm text-red-600">
                  {formErrors.confirm_password}
                </p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="profile-photo"
                className="block text-sm font-medium text-gray-900"
              >
                Profile Photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-6">
                <div className="text-center">
                  {formData?.photo || previewImage ? (
                    <img
                      src={
                        previewImage
                          ? previewImage
                          : `${process.env.REACT_APP_API_URL}/${formData.photo}`
                      }
                      alt="Profile"
                      className="mx-auto h-12 w-12 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-gray-300"
                    />
                  )}
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="profile-file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="profile-file-upload"
                        name="profile-file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              </div>
              {formErrors.photo && (
                <p className="mt-2 text-sm text-red-600">{formErrors.photo}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button onClick={() => navigate("/")} type="button" className="text-sm font-semibold text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
}
