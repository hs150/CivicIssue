import axios from "axios";

function resolveBaseUrl() {
  let url = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
}

export const api = axios.create({
  baseURL: resolveBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("civic_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
