// Login Form с поддержкой email или телефона
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormData, detectInputType } from '@shared/utils/validation';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { useAuth } from '@shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Detect input type as user types
  const emailOrPhone = watch('emailOrPhone');
  React.useEffect(() => {
    if (emailOrPhone) {
      setInputType(detectInputType(emailOrPhone));
    }
  }, [emailOrPhone]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.emailOrPhone, data.password);
      toast.success('Успешный вход!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'email':
        return 'example@mail.com';
      case 'phone':
        return '+7 (700) 123-45-67';
      default:
        return 'Email или +7XXXXXXXXXX';
    }
  };

  const getIcon = () => {
    switch (inputType) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          {...register('emailOrPhone')}
          label="Email или номер телефона"
          placeholder={getPlaceholder()}
          error={errors.emailOrPhone?.message}
          leftIcon={getIcon()}
          type="text"
          autoComplete="username"
          disabled={isSubmitting}
          fullWidth
        />
        
        {inputType === 'phone' && (
          <p className="mt-1.5 text-xs text-gray-500">
            Формат: +7XXXXXXXXXX или 8XXXXXXXXXX
          </p>
        )}
      </div>

      <div>
        <Input
          {...register('password')}
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
          autoComplete="current-password"
          disabled={isSubmitting}
          fullWidth
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Запомнить меня
          </span>
        </label>

        <a
          href="/forgot-password"
          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
        >
          Забыли пароль?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Войти
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта?{' '}
        <a
          href="/register"
          className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          Зарегистрироваться
        </a>
      </div>
    </form>
  );
};

export default LoginForm;






import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormData, detectInputType } from '@shared/utils/validation';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { useAuth } from '@shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Detect input type as user types
  const emailOrPhone = watch('emailOrPhone');
  React.useEffect(() => {
    if (emailOrPhone) {
      setInputType(detectInputType(emailOrPhone));
    }
  }, [emailOrPhone]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.emailOrPhone, data.password);
      toast.success('Успешный вход!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'email':
        return 'example@mail.com';
      case 'phone':
        return '+7 (700) 123-45-67';
      default:
        return 'Email или +7XXXXXXXXXX';
    }
  };

  const getIcon = () => {
    switch (inputType) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          {...register('emailOrPhone')}
          label="Email или номер телефона"
          placeholder={getPlaceholder()}
          error={errors.emailOrPhone?.message}
          leftIcon={getIcon()}
          type="text"
          autoComplete="username"
          disabled={isSubmitting}
          fullWidth
        />
        
        {inputType === 'phone' && (
          <p className="mt-1.5 text-xs text-gray-500">
            Формат: +7XXXXXXXXXX или 8XXXXXXXXXX
          </p>
        )}
      </div>

      <div>
        <Input
          {...register('password')}
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
          autoComplete="current-password"
          disabled={isSubmitting}
          fullWidth
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Запомнить меня
          </span>
        </label>

        <a
          href="/forgot-password"
          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
        >
          Забыли пароль?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Войти
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта?{' '}
        <a
          href="/register"
          className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          Зарегистрироваться
        </a>
      </div>
    </form>
  );
};

export default LoginForm;





