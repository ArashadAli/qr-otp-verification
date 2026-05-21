import axiosInstance from "./axiosInstance";

export const loginApi = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
};