import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/bfhl/tasks';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getTasks = async (params) => {
  const response = await api.get('/', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.patch(`/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

export default api;
