import apiClient from './apiClient';

export const login = async (payload) => {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await apiClient.put('/users/change-password', payload);
  return data;
};



