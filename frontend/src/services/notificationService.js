import axios from "axios";

const API = "http://localhost:5001/api/notifications";

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