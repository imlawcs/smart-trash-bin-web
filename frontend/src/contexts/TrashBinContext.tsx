import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TrashBin } from '../types';
import * as trashBinService from '../services/trashBinService';
import { useAuth } from './AuthContext';

interface TrashBinState {
  trashBins: TrashBin[];
  loading: boolean;
  error: string | null;
  selectedBin: TrashBin | null;
}

interface TrashBinContextProps {
  state: TrashBinState;
  getTrashBins: () => Promise<void>;
  getTrashBin: (id: string) => Promise<void>;
  createTrashBin: (data: Partial<TrashBin>) => Promise<void>;
  updateTrashBin: (id: string, data: Partial<TrashBin>) => Promise<void>;
  deleteTrashBin: (id: string) => Promise<void>;
  clearSelected: () => void;
}

const initialState: TrashBinState = {
  trashBins: [],
  loading: false,
  error: null,
  selectedBin: null,
};

type TrashBinAction =
  | { type: 'GET_BINS_SUCCESS'; payload: TrashBin[] }
  | { type: 'GET_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'CREATE_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'UPDATE_BIN_SUCCESS'; payload: TrashBin }
  | { type: 'DELETE_BIN_SUCCESS'; payload: string }
  | { type: 'BIN_ERROR'; payload: string }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'SET_LOADING' };

const trashBinReducer = (state: TrashBinState, action: TrashBinAction): TrashBinState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'GET_BINS_SUCCESS':
      return {
        ...state,
        trashBins: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_BIN_SUCCESS':
      return {
        ...state,
        selectedBin: action.payload,
        loading: false,
        error: null,
      };
    case 'CREATE_BIN_SUCCESS':
      return {
        ...state,
        trashBins: [...state.trashBins, action.payload],
        loading: false,
        error: null,
      };
    case 'UPDATE_BIN_SUCCESS':
      return {
        ...state,
        trashBins: state.trashBins.map((bin) =>
          bin._id === action.payload._id ? action.payload : bin
        ),
        selectedBin: action.payload,
        loading: false,
        error: null,
      };
    case 'DELETE_BIN_SUCCESS':
      return {
        ...state,
        trashBins: state.trashBins.filter((bin) => bin._id !== action.payload),
        loading: false,
        error: null,
      };
    case 'BIN_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_SELECTED':
      return {
        ...state,
        selectedBin: null,
      };
    default:
      return state;
  }
};

const TrashBinContext = createContext<TrashBinContextProps | undefined>(undefined);

export const TrashBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trashBinReducer, initialState);
  const { state: authState } = useAuth();

  // Load trash bins when authentication state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      getTrashBins();
    }
  }, [authState.isAuthenticated]);

  const getTrashBins = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const bins = await trashBinService.getAllTrashBins();
      dispatch({ type: 'GET_BINS_SUCCESS', payload: bins });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to load trash bins' });
    }
  };

  const getTrashBin = async (id: string) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const bin = await trashBinService.getTrashBin(id);
      dispatch({ type: 'GET_BIN_SUCCESS', payload: bin });
    } catch (error) {
      dispatch({ type: 'BIN_ERROR', payload: 'Failed to load trash bin' });
    }
  };

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
