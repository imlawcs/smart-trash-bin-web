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
  
  export interface TrashBin {
    _id: string;
    name: string;
    location: string;
    capacity: number;
    currentLevel: number;
    threshold: number;
    isFull: boolean;
    lastUpdated: string;
  }
  