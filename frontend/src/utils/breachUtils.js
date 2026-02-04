import axiosInstance from "./axiosInstance";

export const checkBreach = async (password) => {
  const res = await axiosInstance.post("/breach-check", { password });
  return res.data; // { breached, count }
};
