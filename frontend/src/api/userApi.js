import axiosInstance from "./axiosInstance";

export const getUserMeApi = async (id) => {
  const response = await axiosInstance.get(`/users/me/${id}`);
  return response.data;
};