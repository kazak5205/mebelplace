import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Icon, ICON_NAMES } from '@shared/components'
import { registerSchema, type RegisterFormData, detectInputType } from '@shared/utils/validation'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import { useAuth } from '@shared/contexts/AuthContext'

const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth()
  const [inputType, setInputType] = useState<'email' | 'phone' | 'unknown'>('unknown')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'client',
      acceptTerms: false,
    },
  })

  const email = watch('email') || ''
  const phone = watch('phone') || ''
  const identifier = email || phone

  React.useEffect(() => {
    if (identifier) {
      setInputType(detectInputType(identifier))
    } else {
      setInputType('unknown')
    }
  }, [identifier])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      })
      toast.success('Регистрация прошла успешно!')
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка регистрации')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Input
          {...register('name')}
          label="Имя"
          placeholder="Иван Иванов"
          error={errors.name?.message}
          leftIcon={<Icon name="USER" size={20} className="w-5 h-5" />}
          type="text"
          autoComplete="name"
          fullWidth
          disabled={isSubmitting}
        />

        {/* Email/Phone pair (optional one of them required) */}
        <Input
          {...register('email')}
          label="Email (опционально)"
          placeholder="example@mail.com"
          error={errors.email?.message}
          leftIcon={<Icon name="MAIL" size={20} className="w-5 h-5" />}
          type="email"
          autoComplete="email"
          fullWidth
          disabled={isSubmitting}
          onChange={(e) => {
            setValue('email', e.target.value)
          }}
        />

        <Input
          {...register('phone')}
          label="Телефон (опционально)"
          placeholder="+7XXXXXXXXXX"
          error={errors.phone?.message}
          leftIcon={<Icon name="PHONE" size={20} className="w-5 h-5" />}
          type="tel"
          autoComplete="tel"
          fullWidth
          disabled={isSubmitting}
          onChange={(e) => {
            setValue('phone', e.target.value)
          }}
        />

        {inputType === 'phone' && (
          <p className="-mt-2 text-xs text-gray-500">Формат: +7XXXXXXXXXX или 8XXXXXXXXXX</p>
        )}

        <Input
          {...register('password')}
          label="Пароль"
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Icon name="LOCK" size={20} className="w-5 h-5" />}
          type="password"
          autoComplete="new-password"
          fullWidth
          disabled={isSubmitting}
        />

        <Input
          {...register('confirmPassword')}
          label="Подтверждение пароля"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          leftIcon={<Icon name="LOCK" size={20} className="w-5 h-5" />}
          type="password"
          autoComplete="new-password"
          fullWidth
          disabled={isSubmitting}
        />

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('role', 'client', { shouldValidate: true })}
              className="border rounded-md py-2 px-3 text-sm hover:bg-gray-50 data-[active=true]:border-orange-500"
              data-active={watch('role') === 'client'}
            >
              Клиент
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'master', { shouldValidate: true })}
              className="border rounded-md py-2 px-3 text-sm hover:bg-gray-50 data-[active=true]:border-orange-500"
              data-active={watch('role') === 'master'}
            >
              Мастер
            </button>
          </div>
          {errors.role?.message && (
            <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Accept terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('acceptTerms')}
            type="checkbox"
            className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-700">
            Я принимаю условия использования и политику конфиденциальности
          </span>
        </label>
        {errors.acceptTerms?.message && (
          <p className="-mt-2 text-xs text-red-600">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        Зарегистрироваться
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт?{' '}
        <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          Войти
        </a>
      </div>
    </form>
  )
}

export default RegisterForm


