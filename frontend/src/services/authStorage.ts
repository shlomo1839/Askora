import type { User } from '../types/auth.types';

/**
 * שמירה מקומית של סשן בלבד (JWT + משתמש מחובר).
 * סקרים, תשובות ומשתמשים נשמרים ב-MongoDB דרך ה-backend.
 */
const KEYS = {
  CURRENT_USER: 'survey_master_user',
  TOKEN: 'survey_token',
};

export const AuthStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(KEYS.TOKEN);
  },

  setAuth: (user: User, token: string): void => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(KEYS.TOKEN, token);
  },

  getCurrentUser: (): User | null => {
    try {
      const item = localStorage.getItem(KEYS.CURRENT_USER);
      return item ? (JSON.parse(item) as User) : null;
    } catch {
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.TOKEN);
  },

  isLoggedIn: (): boolean => {
    return Boolean(AuthStorage.getToken() && AuthStorage.getCurrentUser());
  },
};
