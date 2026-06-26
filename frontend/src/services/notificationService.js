import axios from "axios";
import { API_BASE_URL } from "../config";

const API = `${API_BASE_URL}/api/notifications`;

export const getNotifications = async () => {
  return axios.get(API, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export const markAsRead = async (id) => {
  return axios.put(
    `${API}/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};

export const markAllAsRead = async () => {
  return axios.put(
    `${API}/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};