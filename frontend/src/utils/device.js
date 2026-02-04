import { v4 as uuidv4 } from "uuid";

export const getDeviceId = () => {
  let id = localStorage.getItem("deviceId");

  if (!id) {
    id = uuidv4();
    localStorage.setItem("deviceId", id);
  }

  return id;
};
