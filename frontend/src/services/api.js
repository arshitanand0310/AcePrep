import axios from "axios";



const API = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true, // for cookies
});



function triggerLogout(reason = "Session expired") {
    console.warn("🔒 Logout:", reason);
    sessionStorage.clear();
    window.dispatchEvent(new Event("auth-logout"));
}



let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,

    async(error) => {
        const originalRequest = error.config;


        if (!error.response) {
            console.error("🚨 Backend unreachable");
            return Promise.reject(error);
        }

        if (
            originalRequest.url.includes("/auth/login") ||
            originalRequest.url.includes("/auth/register") ||
            originalRequest.url.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }


        if (error.response.status === 401 && !originalRequest._retry) {
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