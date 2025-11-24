import apiClient from './apiClient';

export const fetchLookups = async () => {
  const { data } = await apiClient.get('/lookups');
  return data;
};

export const createLookupValue = async (payload) => {
  const { data } = await apiClient.post('/lookups', payload);
  return data;
};

export const deleteLookupValue = async (id) => {
  await apiClient.delete(`/lookups/${id}`);
  return true;
};


