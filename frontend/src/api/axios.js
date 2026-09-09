import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    const isLoginOrRegister =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    // sirf tab logout karo jab token genuinely invalid ho (401),
    // aur login/register/auth-check request khud na ho (unka apna error handling hai)
    if (error.response?.status === 401 && !isLoginOrRegister) {
      localStorage.removeItem("token");
      if (!isAuthCheck) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;