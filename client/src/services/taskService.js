import apiClient from './apiClient';

export const fetchTasks = async (params = {}) => {
  const { data } = await apiClient.get('/tasks', { params });
  return data;
};

export const fetchTask = async (id) => {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await apiClient.post('/tasks', payload);
  return data;
};

export const updateTask = async (id, payload) => {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data;
};

export const removeTask = async (id) => {
  await apiClient.delete(`/tasks/${id}`);
  return true;
};

export const fetchTaskStats = async (params = {}) => {
  const { data } = await apiClient.get('/tasks/stats', { params });
  return data;
};

export const fetchTaskOptions = async () => {
  const { data } = await apiClient.get('/tasks/options');
  return data;
};

