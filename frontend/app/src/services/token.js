const TOKEN_KEY = "accessToken";
const EXPIRATION_KEY = "expirationTime";

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  const expirationTime = new Date(Date.now() + 30 * 60 * 1000);
  localStorage.setItem(EXPIRATION_KEY, expirationTime.getTime());
};

export const getToken = () => {
  const expirationTimeStr = localStorage.getItem(EXPIRATION_KEY);
  const expirationTime = expirationTimeStr ? parseInt(expirationTimeStr) : null;
  if (!expirationTime) {
    return null;
  }
  if (new Date(expirationTime) < new Date()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

export const getUserRoles = () => {
  const token = getToken();
  if (!token) return null;

  const decodedToken = parseJwt(token);
  return decodedToken?.role || null;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expirationTime");
};



