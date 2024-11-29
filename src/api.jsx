import axios from "axios";

// const API_URL = "http://202.131.237.185:8051/api";
const API_URL = "http://127.0.0.1:8000/api";

export const fetchData = async (endpoint) => {
  const response = await axios.get(`${API_URL}/${endpoint}/`);
  return response.data;
};

export const postData = async (endpoint, data) => {
  const response = await axios.post(`${API_URL}/${endpoint}/`, data);
  return response.data;
};

export const updateData = async (endpoint, id, data) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Update failed:", error.message);
    throw error;
  }
};

export const deleteData = async (endpoint, id) => {
  const response = await axios.delete(`${API_URL}/${endpoint}/${id}/`);
  return response.data;
};
