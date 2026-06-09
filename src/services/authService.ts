import { StorageService } from './storage';
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth.types';

export const AuthService = {
  register(data: RegisterFormData): AuthResponse {
    const email = data.email.trim().toLowerCase();

    if (StorageService.findUserByEmail(email)) {
      throw new Error('משתמש עם אימייל זה כבר קיים');
    }

    const user = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email,
      password: data.password,
    };

    StorageService.saveUser(user);

    const { password: _, ...publicUser } = user;
    return {
      message: 'הרשמה בהצלחה',
      token: `local-${user.id}`,
      user: publicUser,
    };
  },

  login(data: LoginFormData): AuthResponse {
    const email = data.email.trim().toLowerCase();
    const user = StorageService.findUserByEmail(email);

    if (!user) {
      throw new Error('לא נמצא משתמש עם אימייל זה. יש להירשם קודם.');
    }

    if (user.password !== data.password) {
      throw new Error('הסיסמה שגויה');
    }

    const { password: _, ...publicUser } = user;
    return {
      message: 'התחברות בהצלחה',
      token: `local-${user.id}`,
      user: publicUser,
    };
  },
};
