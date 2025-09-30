import axios, { type AxiosInstance } from "axios";

const apiBaseURL =
  "https://hjtrv4juxe.execute-api.us-west-2.amazonaws.com/prod";

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
    const auth = localStorage.getItem("podbreaf_auth");
    const authData = auth ? JSON.parse(auth) : null;
    if (authData) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${authData.token}`;
      console.log("Token added to request:", config.url);
    } else {
      console.log("No auth data found in localStorage");
    }
  } catch (error) {
    console.error("Error parsing auth data:", error);
  }
  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - token may be expired");
      // Clear invalid token
      localStorage.removeItem("podbreaf_auth");
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
