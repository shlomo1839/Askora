import { apiRequest } from './api';
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth.types';

export const AuthService = {
  async register(data: RegisterFormData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      },
      false
    );
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      },
      false
    );
  },
};
