// Token management utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export const tokenManager = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    this.removeToken();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },
};
