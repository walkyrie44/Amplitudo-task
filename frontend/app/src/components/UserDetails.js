import React from "react";

const UserDetails = ({ user, onClose }) => {
  if (!user) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center p-6">
          {user.photo ? (
            <img
              src={`${process.env.REACT_APP_API_URL}/${user.photo}`}
              alt={user.full_name}
              className="h-32 w-32 rounded-full object-cover shadow-md border-2 border-gray-200"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Photo
            </div>
          )}
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {user.full_name || "N/A"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {user.email || "Email not provided"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
