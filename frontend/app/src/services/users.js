import httpClient from "./client";


export const getUnfinishedUsers = async (
    page = 1,
    pageSize = 10,
    full_name
  ) => {
    const response = await httpClient.get("/users", {
      params: {
        page,
        limit: pageSize,
        full_name,
      },
    });
    return response;
  };
  
  export const deleteUser = async (userId) => {
    const response = await httpClient.delete(`/users/${userId}/delete`);
    return response;
  };

  export const getFullName = async () => {
    const response = await httpClient.get("/users/name");
    return response;
  }