import api from './api';
import { TrashBin } from '../types';

export const getAllTrashBins = async (): Promise<TrashBin[]> => {
  const response = await api.get('/trash-bins');
  return response.data;
};

export const getTrashBin = async (id: string): Promise<TrashBin> => {
  const response = await api.get(`/trash-bins/${id}`);
  return response.data;
};

export const createTrashBin = async (data: Partial<TrashBin>): Promise<TrashBin> => {
  const response = await api.post('/trash-bins', data);
  return response.data;
};

export const updateTrashBin = async (id: string, data: Partial<TrashBin>): Promise<TrashBin> => {
  const response = await api.put(`/trash-bins/${id}`, data);
  return response.data;
};

export const deleteTrashBin = async (id: string): Promise<void> => {
  await api.delete(`/trash-bins/${id}`);
};
