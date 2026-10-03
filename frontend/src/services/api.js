import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
});

export const errorMessage = (error, fallback = "Something went wrong") =>
    error?.response?.data?.message || error?.message || fallback;

export default api;
