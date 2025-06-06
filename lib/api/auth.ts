// Authentication API client - using Next.js API routes to avoid CORS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

class AuthApi {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data;
  }
  async login(credentials: LoginDto): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: SignupDto): Promise<SignupResponse> {
    return this.makeRequest<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
  async getCurrentUser(token: string): Promise<User> {
    return this.makeRequest<User>('/api/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const authApi = new AuthApi();
