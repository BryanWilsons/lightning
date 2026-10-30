import axios from "axios";

const api = axios.create({
 
 // baseURL: "https://lightningapi-80f094000270.herokuapp.com/", // your backend URL
  baseURL: "http://localhost:5009", // your backend URL
  withCredentials: true, // CRITICAL – sends the HttpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// These will be controlled by AuthContext
let accessToken = null;
let onTokenRefreshed = null;
let onAuthFailure = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setTokenHandlers = ({ onRefreshed, onFailure }) => {
  onTokenRefreshed = onRefreshed;
  onAuthFailure = onFailure;
};

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Silent refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry the refresh endpoint itself
      if (originalRequest.url?.includes("/auth/refresh")) {
        onAuthFailure?.();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh"); // cookie is sent automatically
        const newToken = data.accessToken;

        setAccessToken(newToken);
        onTokenRefreshed?.(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        onAuthFailure?.();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;