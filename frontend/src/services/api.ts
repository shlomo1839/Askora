import axios, { AxiosError } from 'axios';
import { AuthStorage } from './authStorage';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiErrorBody {
  message?: string;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    withAuth?: boolean;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const withAuth = config.withAuth ?? true;

  if (withAuth) {
    const token = AuthStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || 'שגיאה בשרת';
    throw new ApiError(status, message);
  }
);

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  withAuth = true
): Promise<T> {
  const { data } = await api.request<T>({
    url: endpoint,
    method: options.method ?? 'GET',
    data: options.data,
    withAuth,
  });

  return data;
}
