import httpClient from "./client";

export const getApplciation = async () => {
  const response = await httpClient.get("/application-form/single-application");
  return response;
};

export const createOrUpdateForm = async (formData) => {
  const response = await httpClient.put(
    "/application-form",
    formData
  );
  return response;
};
