import axios from "axios";




const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 180000,
});



let isRefreshing = false;
let failedQueue = [];
let manualLogout = false;

export const setManualLogout = () => {
  manualLogout = true;
  sessionStorage.setItem("manualLogout", "true");
};

export const clearManualLogout = () => {
  manualLogout = false;
  sessionStorage.removeItem("manualLogout");
};



function triggerLogout(reason = "Session expired") {
  console.warn("🔒 Logout:", reason);

  manualLogout = true;
  sessionStorage.setItem("manualLogout", "true");

  window.dispatchEvent(new Event("auth-logout"));
}



const processQueue = (error) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve()
  );
  failedQueue = [];
};



API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    
    if (!error.response) {
      console.warn("⏳ Backend waking...");
      return new Promise((resolve) =>
        setTimeout(() => resolve(API(originalRequest)), 5000)
      );
    }

    const url = originalRequest?.url || "";

    
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    
    if (sessionStorage.getItem("manualLogout")) {
      return Promise.reject(error);
    }

    
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !manualLogout
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => API(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await API.post("/auth/refresh");

        processQueue(null);
        return API(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError);
        triggerLogout();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
