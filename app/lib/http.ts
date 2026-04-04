// lib/http.ts
import axios from "axios";
import { useAuthStore } from "@/app/store/authStore"; // Ensure path is correct

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const http = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

// Add the Request Interceptor
http.interceptors.request.use(
  (config) => {
    // 1. Get the current token from the store
    const token = useAuthStore.getState().token;

    // 2. If it exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
