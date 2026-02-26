import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  language: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkTokenExpiry: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });

    window.location.href = '/login';
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();

    if (!refreshToken) {
      get().logout();
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      localStorage.setItem('accessToken', data.accessToken);

      set({
        accessToken: data.accessToken,
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
    }
  },

  checkTokenExpiry: (): boolean => {
    const { accessToken } = get();

    if (!accessToken) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const expiryTime = payload.exp;

      // Refresh token 5 minutes before expiry
      return expiryTime - currentTime > 300;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return false;
    }
  },
}));
