
import axios from "axios";
import { getAccessTokenService, setAccessTokenService } from "./tokenService";
import { getDeviceId } from "./device";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://localhost:3002/api",
  withCredentials: true,
});

// ---------------- REQUEST ----------------
axiosInstance.interceptors.request.use(
  (config) => {
    
    const token = getAccessTokenService();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------- RESPONSE ----------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const deviceId = getDeviceId();

        const res = await axiosInstance.post("/auth/refresh", {
          deviceId,
        });

        setAccessTokenService(res.data.accessToken);
        processQueue(null, res.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        window.dispatchEvent(new Event("force-logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);



export default axiosInstance;
