import axios, { type AxiosInstance } from "axios";
import type { AuthState } from "@/components/auth-context";

const apiBaseURL =
  "https://5kw6e72bw2.execute-api.us-west-2.amazonaws.com/prod";

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Attach Authorization header from localStorage if token exists
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("podbreaf_auth");
    if (raw) {
      const { token } = JSON.parse(raw) as AuthState;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Do nothing
  }
  return config;
});

export default apiClient;
