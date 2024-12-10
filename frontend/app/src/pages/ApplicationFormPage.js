import { useState, useEffect } from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  getPersonalApplication,
  createOrUpdateForm,
} from "../services/applicationForm";
import { getFullName } from "../services/users";
import AlertMessage from "../components/AlertMessage";
import countriesData from "../data/countries.json";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [schools, setSchools] = useState([]);
  const [cvFiles, setCvFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [alertData, setAlertData] = useState({});
  const [isLocked, setIsLocked] = useState(true);
  const [formErrors, setFormErrors] = useState({
    full_name: "",
    birth_date: "",
    country: "",
    city: "",
    gender: "",
    education: "",
    profile_picture: "",
    cv_files: "",
  });
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    country: "",
    city: "",
    gender: "",
    education: "",
    profile_picture: "",
    cv_files: [],
  });

  useEffect(() => {
    const country = countriesData.countries.find(
      (country) => country.name === selectedCountry
    );
    setSchools(country ? country.schools : []);
  }, [selectedCountry]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const fetchData = async () => {
    try {
      const data = await getPersonalApplication();
      setLoading(true);
      const formDataFromAPI = data && typeof data === "object" ? data : {};
      setFormData({
        full_name: formDataFromAPI.full_name ? formDataFromAPI.full_name: await fetchFullName(),
        birth_date: formDataFromAPI.birth_date || "",
        country: formDataFromAPI.country || "",
        city: formDataFromAPI.city || "",
        gender: formDataFromAPI.gender || "",
        education: formDataFromAPI.education || "",
        profile_picture: formDataFromAPI.profile_picture || "",
        cv_files: formDataFromAPI.cv_files || [],
      });
      checkFormCompletion(formDataFromAPI);
      setSelectedCountry(formDataFromAPI.country || "");
    } catch {
      setAlertData({
        message: "An error occurred, try again later",
        alertType: "dismiss",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchFullName = async () => {
    try {
      const response = await getFullName();
      console.log(response)
      return response;
    } catch {
      setAlertData({
        message: "An error occurred, try again later",
        alertType: "dismiss",
      });
    }
  };

  const checkFormCompletion = (data) => {
    const isComplete = Object.values(data).some(
      (value) => value !== "" && value.length !== 0
    );
    setIsLocked(!isComplete);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await createOrUpdateForm(formData);
      fetchData();
      setIsLocked(false);
      setAlertData({
        message: "Form submited succesfully",
        alertType: "success",
      });
    } catch (err) {
      setAlertData({
        message: "Unable to sened form, try again later",
        alertType: "dismiss",
      });
    }
  };

  const toggleFormLock = () => {
    setIsLocked((prev) => !prev);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 10 * 1024 * 1024;
    const allowedImageFormats = ["jpg", "jpeg", "png"];
    const allowedCVFormats = ["pdf", "docx"];

    if (files.some((file) => file.size > maxFileSize)) {
      setAlertData({
        message: "One or more files exceed the size limit of 10 MB.",
        alertType: "dismiss",
      });
      return;
    }

    if (type === "cv" && cvFiles.length + files.length > 3) {
      setAlertData({
        message: "You can upload a maximum of 3 CV files.",
        alertType: "dismiss",
      });
      return;
    }

    if (files.length > 0) {
      const newFiles = [...cvFiles];
      const reader = new FileReader();
      let fileIndex = 0;

      const readNextFile = () => {
        if (fileIndex < files.length) {
          const file = files[fileIndex];
          const fileExtension = file.name.split(".").pop().toLowerCase();

          if (
            type === "profile-photo" &&
            !allowedImageFormats.includes(fileExtension)
          ) {
            setAlertData({
              message:
                "Only JPG, JPEG, and PNG formats are allowed for profile photos.",
              alertType: "dismiss",
            });
            return;
          }
          if (type === "cv" && !allowedCVFormats.includes(fileExtension)) {
            setAlertData({
              message: "Only PDF and DOCX formats are allowed for CV files.",
              alertType: "dismiss",
            });
            return;
          }
          reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];

            if (type === "profile-photo") {
              setFormData({ ...formData, profile_picture: base64String });
              setPreviewImage(reader.result);
              setFormErrors((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors.profile_picture;
                return updatedErrors;
              });
            } else if (type === "cv") {
              newFiles.push(base64String);
              setCvFiles(newFiles);
              setFormData({ ...formData, cv_files: newFiles });
              setFormErrors((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors.cv_files;
                return updatedErrors;
              });
            }
            fileIndex++;
            readNextFile();
          };

          reader.readAsDataURL(file);
        }
      };

      readNextFile();
    }
  };

  const handleClose = () => {
    setAlertData({ message: "", alertType: "" });
  };

  const validateForm = () => {
    const requiredFields = [
      "full_name",
      "birth_date",
      "country",
      "city",
      "gender",
      "education",
      "profile_picture",
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].length === 0) {
        errors[field] = `${field.replace("_", " ")} is required`;
      }
    });
    if (formData.cv_files.length === 0) {
      errors.cv_files = "At least one CV file is required";
    }

    const today = new Date();
    const birthDate = new Date(formData.birth_date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (!formData.birth_date || age < 18) {
      errors.birth_date = "You must be at least 18 years old.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <>
      <AlertMessage
        message={alertData.message}
        alertType={alertData.alertType}
        onClose={handleClose}
      />
      <LoadingSpinner loading={loading} />
      {isLocked ? (
        <form
          className="max-w-3xl mx-auto p-6 space-y-8"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Application Form
          </h2>
          <div className="border-b border-gray-900/10 pb-12">
            <label
              htmlFor="education"
              className="block text-lg font-medium text-gray-900 mb-4"
            >
              Personal Information
            </label>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData?.full_name || ""}
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
                  htmlFor="birth-date"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Date of Birth
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData?.birth_date || ""}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
                />
                {formErrors.birth_date && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.birth_date}
                  </p>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData?.country || ""}
                  onChange={(e) => {
                    handleInputChange(e);
                    handleCountryChange(e);
                  }}
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
                >
                  <option value="" disabled>
                    Select your country
                  </option>
                  {countriesData.countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {formErrors.country && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.country}
                  </p>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData?.city || ""}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
                />
                {formErrors.city && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.city}</p>
                )}

                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-900 text-left mt-6"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData?.gender || ""}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option>male</option>
                  <option>female</option>
                  <option>other</option>
                </select>
                {formErrors.gender && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.gender}
                  </p>
                )}
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="profile-photo"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  Profile Photo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-6">
                  <div className="text-center">
                    {formData?.profile_picture || previewImage ? (
                      <img
                        src={
                          previewImage
                            ? previewImage
                            : `${process.env.REACT_APP_API_URL}/${formData.profile_picture}`
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
                          onChange={(e) => handleFileChange(e, "profile-photo")}
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
                {formErrors.profile_picture && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.profile_picture}
                  </p>
                )}
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="education"
                  className="block text-lg font-medium text-gray-900"
                >
                  Education
                </label>
                <div className="mt-2 space-y-4">
                  <div>
                    <label
                      htmlFor="education"
                      className="block text-sm font-medium text-gray-900 text-left"
                    >
                      School (city)
                    </label>
                    <select
                      id="education"
                      name="education"
                      value={formData?.education || ""}
                      onChange={handleInputChange}
                      className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 px-4 py-3 text-sm"
                    >
                      <option value="" disabled>
                        Select school
                      </option>
                      {schools.map((school) => (
                        <option
                          key={school.name}
                          value={`${school.name}, ${school.city}`}
                        >
                          {school.name}, {school.city}
                        </option>
                      ))}
                    </select>
                    {formErrors.education && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.education}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="cv"
                  className="block text-sm font-medium text-gray-900 text-left"
                >
                  CV Upload
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <PhotoIcon
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-gray-300"
                    />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="cv-file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="cv-file-upload"
                          name="cv-file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "cv")}
                          accept=".pdf,.docx"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      PDF, DOCX up to 10MB
                    </p>
                  </div>
                </div>
                {formErrors.cv_files && (
                  <p className="mt-2 text-sm text-red-600">
                    {formErrors.cv_files}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">
                Selected CV Files
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {(formData?.cv_files).map((file, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">File {index + 1}</span>
                    <a
                      href={`${process.env.REACT_APP_API_URL}/${file}`}
                      download={`cv-file-${index + 1}.pdf`}
                      className="text-indigo-600 hover:text-indigo-500"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Uploaded document
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              onClick={() => setIsLocked(false)}
              type="button"
              className="text-sm font-semibold text-gray-900"
            >
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
      ) : (
        <div className="relative h-[93vh] bg-gray-100">
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Application Form
            </h2>
            <p className="text-gray-700 mt-2">
              You can open the job application form here.
            </p>
            <button
              onClick={toggleFormLock}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              View / Edit Form
            </button>
          </div>
        </div>
      )}
    </>
  );
}
