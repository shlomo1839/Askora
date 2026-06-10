import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth-request';
import { User, toPublicUser } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as RegisterBody;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError(400, 'יש למלא שם, אימייל וסיסמה');
  }

  if (password.length < 6) {
    throw new AppError(400, 'הסיסמה חייבת להכיל לפחות 6 תווים');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(409, 'משתמש עם אימייל זה כבר קיים');
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken(user.id);

  res.status(201).json({
    message: 'הרשמה בהצלחה',
    token,
    user: toPublicUser(user),
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;

  if (!email?.trim() || !password) {
    throw new AppError(400, 'יש למלא אימייל וסיסמה');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(404, 'לא נמצא משתמש עם אימייל זה. יש להירשם קודם.');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'הסיסמה שגויה');
  }

  const token = signToken(user.id);

  res.json({
    message: 'התחברות בהצלחה',
    token,
    user: toPublicUser(user),
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthRequest;
  const user = await User.findOne({ id: userId });

  if (!user) {
    throw new AppError(404, 'משתמש לא נמצא');
  }

  res.json({ user: toPublicUser(user) });
}
