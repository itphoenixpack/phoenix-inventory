import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const company = (localStorage.getItem("company") || "phoenix").toLowerCase();
  if (token) {
    config.headers.Authorization = token;
  }
  config.headers["x-company"] = company;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Catch 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("company");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;