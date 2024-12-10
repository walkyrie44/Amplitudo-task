import React, { useState, useEffect } from "react";
import { getApplicationAndUserData } from "../services/applicationForm";
import { getUnfinishedUsers, deleteUser } from "../services/auth";
import UserDetails from "../components/UserDetails";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const AdminDashboard = () => {
  const [applicationForm, setApplicationForm] = useState([]);
  const [unfinishedUsers, setUnfinishedUsers] = useState([]);
  const [showUsersOnly, setShowUsersOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({});
  //   const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchParams, setSearchParams] = useState({
    full_name: "",
    city: "",
    education: "",
  });

  useEffect(() => {
    if (!showUsersOnly) {
      applicationFormData(page, pageSize, searchParams);
    } else {
      fetchUnfinishedUsers(page, pageSize, searchParams.full_name);
    }
  }, [page, pageSize, showUsersOnly, searchParams]);

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const applicationFormData = async (page, pageSize, filters) => {
    try {
      const response = await getApplicationAndUserData(page, pageSize, filters);
      setLoading(true);
      setApplicationForm(response.items);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
    } catch (error) {
      setAlertData({
        message: "An error occurred, try again later",
        alertType: "dismiss",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnfinishedUsers = async (page, pageSize, filters) => {
    try {
      setLoading(true);
      const response = await getUnfinishedUsers(page, pageSize, filters);
      setUnfinishedUsers(response.items);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
    } catch (error) {
      setAlertData({
        message: "An error occurred, try again later",
        alertType: "dismiss",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      if (showUsersOnly) {
        fetchUnfinishedUsers();
      } else {
        applicationFormData(page, pageSize);
      }
    } catch (error) {
      setAlertData({
        message: "Problem with deleting user, try again later.",
        alertType: "dismiss",
      });
    }
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
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
      <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-8">
        <div className="sm:flex sm:items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Users
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              List of all applicants.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showUsersOnly}
                onChange={() => setShowUsersOnly(!showUsersOnly)}
                className="sr-only peer"
              />
              <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 dark:bg-gray-700">
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform transform ${
                    showUsersOnly ? "translate-x-6" : ""
                  }`}
                ></span>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Users Without Application
              </span>
            </label>
            <button
              // onClick={() => setIsAddFormOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Add User
            </button>
          </div>
        </div>
        {!showUsersOnly ? (
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              name="full_name"
              value={searchParams.full_name}
              onChange={handleSearchChange}
              placeholder="Search by name"
              className="border px-4 py-2 rounded-md w-full"
            />
            <input
              type="text"
              name="city"
              value={searchParams.city}
              onChange={handleSearchChange}
              placeholder="Search by city"
              className="border px-4 py-2 rounded-md w-full"
            />
            <input
              type="text"
              name="education"
              value={searchParams.education}
              onChange={handleSearchChange}
              placeholder="Search by school"
              className="border px-4 py-2 rounded-md w-full"
            />
            <button
              onClick={() => {
                setPage(1);

                applicationFormData(1, pageSize, searchParams);
              }}
              className="block rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Search
            </button>
          </div>
        ) : (
          <div className="mt-4 flex gap-4 justify-end">
            <input
              type="text"
              name="full_name"
              value={searchParams.full_name}
              onChange={handleSearchChange}
              placeholder="Search by name"
              className="border px-4 py-2 rounded-md w-64"
            />
            <button
              onClick={() => {
                setPage(1);
                fetchUnfinishedUsers(1, pageSize, searchParams.full_name);
              }}
              className="block rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Search
            </button>
          </div>
        )}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {!showUsersOnly && (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Birth Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Country
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          City
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          CV Files
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Education
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Gender
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Application Photo
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {applicationForm.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-gray-900 sm:pl-6">
                            {user.full_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.birth_date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.country}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.city}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.cv_files && user.cv_files.length > 0
                              ? user.cv_files.map((file, index) => (
                                  <a
                                    key={index}
                                    href={`${process.env.REACT_APP_API_URL}/${file}`}
                                    download={`cv-file-${index + 1}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    CV File {index + 1 + " "}
                                  </a>
                                ))
                              : "No CV Files"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.education || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.gender || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.profile_picture ? (
                              <a
                                href={`${process.env.REACT_APP_API_URL}/${user.profile_picture}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/${user.profile_picture}`}
                                  alt="Application Photo"
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </a>
                            ) : (
                              "No Photo"
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              onClick={() => handleViewUser(user.user)}
                            >
                              View User
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="ml-4 text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {showUsersOnly && (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Photo
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {unfinishedUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 text-sm font-medium text-gray-900 sm:pl-6">
                            {user.full_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.photo ? (
                              <img
                                src={`${process.env.REACT_APP_API_URL}/${user.photo}`}
                                alt="User Profile"
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              "No Photo"
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {/* <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleViewUser(user)}
                          >
                            View User
                          </button> */}
                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              className="ml-4 text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 pt-10">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages).keys()].map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                      page === pageNum + 1
                        ? "bg-indigo-600 text-white"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
        {isDeleteModalOpen && userToDelete && (
          <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            titleText="Are you sure you want to delete this user?"
            deleteMessage="This action is irreversible"
            onClose={handleCloseDeleteModal}
            onConfirm={() => handleDeleteUser(userToDelete.id)}
          />
        )}
        {selectedUser && (
          <UserDetails user={selectedUser} onClose={handleCloseModal} />
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
