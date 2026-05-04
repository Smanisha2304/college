

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080"
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
console.log("testing the token from auxios-------------------------")
  return config;
});

export default instance;