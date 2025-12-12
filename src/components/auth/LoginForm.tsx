import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../ui';
import { authStore } from '../../stores/authStore';
import { authService } from '../../lib/authService';
import { mockLogin, isMockMode } from '../../lib/mockAuth';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = authStore((state) => state.login);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Prevent double submission
    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);

    try {
      let response;

      if (isMockMode()) {
        // Use mock authentication for development
        response = await mockLogin(data.email, data.password);
        login(response.user, response.access_token, 'mock-refresh-token');
      } else {
        // Use real API authentication
        response = await authService.login({
          email: data.email,
          password: data.password,
        });
        login(response.user, response.accessToken, response.refreshToken);
      }

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate('/leads', { replace: true });
    } catch (error: any) {
      setIsLoggingIn(false);
      
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof LoginFormData, {
            message: (messages as string[])[0],
          });
        });
      } else {
        setError('root', { 
          message: error.message || 'Login failed. Please check your credentials.' 
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 text-center">
              <strong>Real API Integration:</strong> Try these credentials:<br/>
              - admin@example.com / admin123<br/>
              - superadmin@authservice.com / SuperAdmin@123<br/>
              <em>Or any mock credentials as fallback</em>
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              disabled={isLoggingIn}
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              disabled={isLoggingIn}
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoggingIn}
                {...register('remember_me')}
              />
              <label className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          {errors.root && (
            <div className="text-red-600 text-sm text-center">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting || isLoggingIn}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};