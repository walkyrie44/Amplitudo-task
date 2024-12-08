import React, { useEffect, useState } from "react";

const AlertMessage = ({ message, alertType, onClose }) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const alertTypeClass = alertType === "success"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";

  useEffect(() => {
    if (alertType) {
      const id = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [alertType, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 p-4 transition-opacity duration-300 opacity-100">
      <div className={`rounded-md bg-opacity-90 p-4 ${alertTypeClass}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {alertType === "success" && (
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="flex-grow ml-3 text-sm font-medium">{message}</div>
          <div>
            {(alertType === "dismiss" || alertType === "success") && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
