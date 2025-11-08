import apiClient from './client';
import { User } from '../store/useUserStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data.user || response.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.user || response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await apiClient.post('/auth/password-reset', { email });
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};
