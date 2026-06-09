import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { StorageService } from '../services/storage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!StorageService.isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
