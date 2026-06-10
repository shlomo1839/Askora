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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const token = AuthStorage.getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (withAuth && token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'שגיאה בשרת');
  }

  return data;
}
