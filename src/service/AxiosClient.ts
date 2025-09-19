import axios from "axios";

// Create instance
const axiosClient = axios.create({
  baseURL: "https://dasalon-blog-73430e9b5067.herokuapp.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 REQUEST INTERCEPTOR: Add token
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// ❌ RESPONSE INTERCEPTOR: Handle errors globally
// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized (e.g., logout or redirect to login)
//       console.error("Unauthorized - redirecting to login...");
//     }

//     // You can customize more status code handlers here
//     return Promise.reject(error);
//   }
// );

export default axiosClient;
