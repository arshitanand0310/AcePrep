import axios from "axios";

const baseURL =
    import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : "http://localhost:5000/api";

const API = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 180000,
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
            console.warn("Backend waking...");
            return new Promise((resolve) =>
                setTimeout(() => resolve(API(originalRequest)), 5000)
            );
        }

        const url = originalRequest?.url || "";

        if (
            url.includes("/auth/login") ||
            url.includes("/auth/register") ||
            url.includes("/auth/refresh") ||
            url.includes("/auth/me") ||
            url.includes("/auth/logout") ||
            url.includes("/report") ||
            url.includes("/interview")
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
