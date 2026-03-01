import axios from "axios";

const baseURL =
    import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : "http://localhost:5000/api";

const API = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 60000,
});

let isRefreshing = false;
let failedQueue = [];
let isLoggedOut = false;

export const resetLogoutState = () => {
    isLoggedOut = false;
};

function triggerLogout(reason = "Session expired") {
    console.warn("🔒 Logout:", reason);

    isLoggedOut = true;

    sessionStorage.clear();
    window.dispatchEvent(new Event("auth-logout"));
}

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        error ? prom.reject(error) : prom.resolve();
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (!error.response)
            return Promise.reject(error);

        const url = originalRequest?.url || "";

        if (
            url.includes("/auth/login") ||
            url.includes("/auth/register") ||
            url.includes("/auth/refresh") ||
            url.includes("/auth/me") ||
            url.includes("/auth/logout")
        ) {
            return Promise.reject(error);
        }

        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !isLoggedOut
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
                triggerLogout("Session expired");
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
