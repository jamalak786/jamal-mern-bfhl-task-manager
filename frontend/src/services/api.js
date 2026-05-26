import axios from 'axios';

// Base URL is the server domain (e.g. http://localhost:5000 or deployed domain)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getTasks = async (params) => {
  const response = await api.get('/bfhl/tasks', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/bfhl/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.patch(`/bfhl/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/bfhl/tasks/${id}`);
  return response.data;
};

export const getTaskStats = async () => {
  const response = await api.get('/bfhl/tasks/stats');
  return response.data;
};

export default api;
