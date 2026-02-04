// import axios from "axios";
// import { triggerLogout } from "./authEvents";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3002/api",
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     console.log("AXIOS TOKEN:", token); // 👈 ADD

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // if (error.response?.status === 401) {
//     //   localStorage.removeItem("token");
//     //   //window.location.href = "/login";
//     //   triggerLogout(); // 🔥 tell React to logout properly
//     // }
//     if (error.response?.status === 401) {
//       const token = localStorage.getItem("token");
//       if (token) {
//         localStorage.removeItem("token");
//         triggerLogout();
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;

import axios from "axios";
import { getAccessTokenService, setAccessTokenService } from "./tokenService";
import { getDeviceId } from "./device";
import { triggerLogout } from "./authEvents";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3002/api",
  //baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002/api",
  withCredentials: true,
});

// ---------------- REQUEST ----------------
axiosInstance.interceptors.request.use(
  (config) => {
    // const accessToken = window.__accessToken;

    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }

    // return config;

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

// axiosInstance.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/auth/refresh")
//     ) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: (token) => {
//               originalRequest.headers.Authorization = "Bearer " + token;
//               resolve(axiosInstance(originalRequest));
//             },
//             reject,
//           });
//         });
//       }

//       isRefreshing = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         const deviceId = getDeviceId();

//         const res = await axiosInstance.post("/auth/refresh", {
//           refreshToken,
//           deviceId,
//         });

//         const { accessToken, refreshToken: newRefresh } = res.data;

//         window.__accessToken = accessToken;
//         localStorage.setItem("refreshToken", newRefresh);

//         processQueue(null, accessToken);

//         originalRequest.headers.Authorization = "Bearer " + accessToken;
//         return axiosInstance(originalRequest);
//       } catch (err) {
//         processQueue(err, null);
//         triggerLogout();
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(error);
//   },
// );

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const deviceId = getDeviceId();

        const res = await axiosInstance.post("/auth/refresh", {
          refreshToken,
          deviceId,
        });

        setAccessTokenService(res.data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        window.dispatchEvent(new Event("force-logout"));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
