import api from './api';
import { TrashBin } from '../types';

const retry = async <T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error; // Throw error on last retry
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
    }
  }
  throw new Error('Unexpected error in retry logic');
};

export const getAllTrashBins = async (): Promise<TrashBin[]> => {
  try {
    return await retry(async () => {
      const response = await api.get('/trash-bin');
      return response.data;
    });
  } catch (error) {
    console.error('Error fetching trash bins:', error);
    throw new Error('Failed to fetch trash bins. Please try again later.');
  }
};

export const getTrashBin = async (id: string): Promise<TrashBin> => {
  try {
    return await retry(async () => {
      const response = await api.get(`/trash-bin/${id}`);
      console.log('API response:', response.data); // Kiểm tra dữ liệu API trả về
      return response.data; // Trả về toàn bộ dữ liệu, bao gồm cả compartments
    });
  } catch (error) {
    console.error(`Error fetching trash bin ${id}:`, error);
    throw new Error(`Failed to fetch trash bin with ID ${id}. Please try again later.`);
  }
};

export const createTrashBin = async (data: Partial<TrashBin>): Promise<TrashBin> => {
  try {
    return await retry(async () => {
      const response = await api.post('/trash-bin', data);
      return response.data;
    });
  } catch (error) {
    console.error('Error creating trash bin:', error);
    throw new Error('Failed to create trash bin. Please try again later.');
  }
};

export const updateTrashBin = async (id: string, data: Partial<TrashBin>): Promise<TrashBin> => {
  try {
    return await retry(async () => {
      const response = await api.put(`/trash-bin/${id}`, data);
      return response.data;
    });
  } catch (error) {
    console.error(`Error updating trash bin ${id}:`, error);
    throw new Error(`Failed to update trash bin with ID ${id}. Please try again later.`);
  }
};

export const deleteTrashBin = async (id: string): Promise<void> => {
  try {
    await retry(async () => {
      await api.delete(`/trash-bin/${id}`);
    });
  } catch (error) {
    console.error(`Error deleting trash bin ${id}:`, error);
    throw new Error(`Failed to delete trash bin with ID ${id}. Please try again later.`);
  }
};