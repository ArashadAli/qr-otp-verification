import axiosInstance from "./axiosInstance";

export const verifyByQRApi = async (qrData) => {
  const response = await axiosInstance.post("/admin/verify/qr", { qrData });
  return response.data;
};

export const verifyByOTPApi = async (otp) => {
  const response = await axiosInstance.post("/admin/verify/otp", { otp });
  return response.data;
};

export const makeDecisionApi = async (userId, decision, adminId) => {
  const response = await axiosInstance.post("/admin/verification/decision", {
    userId,
    decision,
    adminId,
  });
  return response.data;
};