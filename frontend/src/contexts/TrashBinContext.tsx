import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { TrashBin } from '../types';
import * as trashBinService from '../services/trashBinService';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket } from '../services/socketService';

interface TrashBinState {
  trashBins: TrashBin[];
  binCache: Record<string, TrashBin>;
  loading: boolean;
  error: string | null;
  selectedBin: TrashBin | null;
  ongoingRequests: Set<string>;
  notification: { message: string; binId: string; compartmentType: string } | null;
}

interface TrashBinContextProps {
  state: TrashBinState;
  getTrashBins: () => Promise<void>;
  getTrashBin: (id: string) => Promise<void>;
  createTrashBin: (data: Partial<TrashBin>) => Promise<void>;
  updateTrashBin: (id: string, data: Partial<TrashBin>) => Promise<void>;
  deleteTrashBin: (id: string) => Promise<void>;
  clearSelected: () => void;
  clearNotification: () => void;
}

const initialState: TrashBinState = {
  trashBins: [],
  binCache: {},
  loading: false,
  error: null,
  selectedBin: null,
  ongoingRequests: new Set(),
  notification: null,
};

type TrashBinAction =
  | { type: 'GET_BINS_SUCCESS'; payload: TrashBin[] }
  | { type: 'GET_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'CREATE_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'UPDATE_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'DELETE_BIN_SUCCESS'; payload: string }
  | { type: 'BIN_ERROR'; payload: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'SET_LOADING' }
  | { type: 'ADD_REQUEST'; payload: string }
  | { type: 'REMOVE_REQUEST'; payload: string }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; binId: string; compartmentType: string } }
  | { type: 'CLEAR_NOTIFICATION' };

const trashBinReducer = (state: TrashBinState, action: TrashBinAction): TrashBinState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'GET_BINS_SUCCESS':
      const binCache = action.payload.reduce((acc, bin) => {
        acc[bin._id] = bin;
        return acc;
      }, {} as Record<string, TrashBin>);
      return { ...state, trashBins: action.payload, binCache, loading: false, error: null };
      case 'GET_BIN_SUCCESS':
        console.log('Saving bin to state:', action.payload);
        return {
          ...state,
          selectedBin: action.payload,
          binCache: { ...state.binCache, [action.payload._id]: action.payload },
          loading: false,
          error: null,
        };
    case 'CREATE_BIN_SUCCESS':
      return {
        ...state,
        trashBins: [...state.trashBins, action.payload],
        binCache: { ...state.binCache, [action.payload._id]: action.payload },
        loading: false,
        error: null,
      };
    case 'UPDATE_BIN_SUCCESS':
      return {
        ...state,
        trashBins: state.trashBins.map((bin) => (bin._id === action.payload._id ? action.payload : bin)),
        binCache: { ...state.binCache, [action.payload._id]: action.payload },
        selectedBin: action.payload,
        loading: false,
        error: null,
      };
    case 'DELETE_BIN_SUCCESS':
      const newBinCache = { ...state.binCache };
      delete newBinCache[action.payload];
      return {
        ...state,
        trashBins: state.trashBins.filter((bin) => bin._id !== action.payload),
        binCache: newBinCache,
        selectedBin: null,
        loading: false,
        error: null,
      };
    case 'BIN_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_SELECTED':
      return { ...state, selectedBin: null };
    case 'ADD_REQUEST':
      return { ...state, ongoingRequests: new Set(state.ongoingRequests).add(action.payload) };
    case 'REMOVE_REQUEST':
      const newRequests = new Set(state.ongoingRequests);
      newRequests.delete(action.payload);
      return { ...state, ongoingRequests: newRequests };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };
    default:
      return state;
  }
};

const TrashBinContext = createContext<TrashBinContextProps | undefined>(undefined);

export const TrashBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trashBinReducer, initialState);
  const { state: authState } = useAuth();
  const lastFetchedBinId = useRef<string | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated && state.trashBins.length === 0 && !state.loading) {
      getTrashBins();
    }
  }, [authState.isAuthenticated, state.trashBins.length, state.loading]);

  // WebSocket connection
  useEffect(() => {
    const handleTrashFull = (data: { message: string; binId: string; compartmentType: string; sensorId?: string; timestamp: string }) => {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          message: data.message,
          binId: data.binId,
          compartmentType: data.compartmentType,
        },
      });
      // Tự động xóa thông báo sau 5 giây
      setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);
      // Chỉ gọi getTrashBin nếu binId khác với lần fetch gần nhất
      if (lastFetchedBinId.current !== data.binId) {
        lastFetchedBinId.current = data.binId;
        getTrashBin(data.binId);
      }
    };

    initSocket(handleTrashFull);

    return () => {
      disconnectSocket();
    };
  }, []);

  const getTrashBins = async () => {
    if (state.loading) return;
    dispatch({ type: 'SET_LOADING' });
    try {
      const bins = await trashBinService.getAllTrashBins();
      dispatch({ type: 'GET_BINS_SUCCESS', payload: bins });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to load trash bins' });
    }
  };

  const getTrashBin = useCallback(async (id: string) => {
    const requestKey = `getTrashBin_${id}`;
    if (state.ongoingRequests.has(requestKey)) return;
  
    dispatch({ type: 'ADD_REQUEST', payload: requestKey });
    dispatch({ type: 'SET_LOADING' });
    try {
      const bin = await trashBinService.getTrashBin(id);
      console.log('Fetched bin:', bin);
      // So sánh trước khi dispatch để tránh cập nhật không cần thiết
      if (JSON.stringify(state.binCache[id]) !== JSON.stringify(bin)) {
        dispatch({ type: 'GET_BIN_SUCCESS', payload: bin });
      }
    } catch (error) {
      console.log('Error fetching bin:', error);
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to load trash bin' });
    } finally {
      dispatch({ type: 'REMOVE_REQUEST', payload: requestKey });
    }
  }, []);

  const createTrashBin = async (data: Partial<TrashBin>) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const bin = await trashBinService.createTrashBin(data);
      dispatch({ type: 'CREATE_BIN_SUCCESS', payload: bin });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to create trash bin' });
    }
  };

  const updateTrashBin = async (id: string, data: Partial<TrashBin>) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const bin = await trashBinService.updateTrashBin(id, data);
      dispatch({ type: 'UPDATE_BIN_SUCCESS', payload: bin });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to update trash bin' });
    }
  };

  const deleteTrashBin = async (id: string) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      await trashBinService.deleteTrashBin(id);
      dispatch({ type: 'DELETE_BIN_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to delete trash bin' });
    }
  };

  const clearSelected = () => {
    dispatch({ type: 'CLEAR_SELECTED' });
  };

  const clearNotification = () => {
    dispatch({ type: 'CLEAR_NOTIFICATION' });
  };

  return (
    <TrashBinContext.Provider
      value={{
        state,
        getTrashBins,
        getTrashBin,
        createTrashBin,
        updateTrashBin,
        deleteTrashBin,
        clearSelected,
        clearNotification,
      }}
    >
      {children}
    </TrashBinContext.Provider>
  );
};

export const useTrashBin = (): TrashBinContextProps => {
  const context = useContext(TrashBinContext);
  if (!context) {
    throw new Error('useTrashBin must be used within a TrashBinProvider');
  }
  return context;
};