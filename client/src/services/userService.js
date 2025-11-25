import apiClient from './apiClient';

export const fetchUsers = async () => {
  const { data } = await apiClient.get('/users');
  return data;
};

export const createUserAccount = async (payload) => {
  const { data } = await apiClient.post('/users', payload);
  return data;
};




