import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/authService';
import type { LoginFormData, RegisterFormData } from '../types/auth.types';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (StorageService.isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSubmit = async (data: LoginFormData): Promise<string | null> => {
    try {
      const response = AuthService.login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      StorageService.setAuth(response.user);
      navigate('/dashboard');
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'שגיאה בהתחברות';
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData): Promise<string | null> => {
    try {
      const response = AuthService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      StorageService.setAuth(response.user);
      navigate('/dashboard');
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'שגיאה בהרשמה';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              {isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}
            </Typography>

            {isLogin ? (
              <LoginForm
                onSwitchToRegister={() => setIsLogin(false)}
                onSubmit={handleLoginSubmit}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setIsLogin(true)}
                onSubmit={handleRegisterSubmit}
              />
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
