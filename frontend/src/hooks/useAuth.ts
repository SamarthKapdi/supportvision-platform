import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';
import { ROUTES } from '../utils/constants';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
      toast.success('Logged in successfully');
      
      if (response.data.user.role === Role.ADMIN) {
        navigate(ROUTES.ADMIN);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to login';
      toast.error(message);
    },
  });

  const logout = () => {
    storeLogout();
    navigate(ROUTES.LOGIN);
    toast.success('Logged out');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
};
