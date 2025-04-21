export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Compartment {
  _id: string;
  binId: string;
  type: string; // 'plastic', 'paper', 'metal', 'trash'
  sensorId: string;
  isFull: boolean;
}

export interface TrashBin {
  _id: string;
  name: string;
  location?: string;
  latitude: number;
  longitude: number;
  currentLevel?: number;
  capacity?: number;
  threshold?: number;
  isFull: boolean;
  lastUpdated?: string | Date;
  compartments?: Compartment[];
}