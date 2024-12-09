import httpClient from "./client";

export const getPersonalApplication = async () => {
  const response = await httpClient.get("/application-form/single-application");
  return response;
};

export const createOrUpdateForm = async (formData) => {
  const response = await httpClient.put("/application-form", formData);
  return response;
};

export const getApplicationAndUserData = async (page = 1, pageSize = 10) => {
  const response = await httpClient.get("/application-form/", {
    params: {
      page,
      limit: pageSize,
    },
  });
  return response;
};
