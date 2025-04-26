import InputError from '@/components/atoms/InputError';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';
import AuthLayout from '@/layouts/AuthLayout';
import { useUserStore } from '@/store/UserStore';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

interface RegisterFormData {
  email: string;
  password: string;
}

export function RegisterTemplate() {
  const { setTheme } = useTheme();
  const { insertUserAdmin } = useUserStore();
  const [stateStart, setStateStart] = useState(false);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<RegisterFormData>();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const mutationRegisterUser = useMutation({
    mutationKey: ['insertar usuario admin'],
    mutationFn: async (data: RegisterFormData) => {
      setProcessing(true);
      try {
        const dataUser = { email: data.email, password: data.password };
        const dataStore = await insertUserAdmin(dataUser);
        if (dataStore) {
          localStorage.removeItem('vite-ui-theme');
          navigate('/');
        } else {
          setStateStart(true);
        }
      } finally {
        setProcessing(false);
      }
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setProcessing(true);
    try {
      await mutationRegisterUser.mutateAsync(data);
    } catch (error) {
      console.error('Error en el registro:', error);
      setStateStart(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AuthLayout title="Create an account" description="Enter your details below to create your account">
      {stateStart && <span className="text-sm text-red-500">Invalid email or password. Please try again.</span>}
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="email@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <InputError message={errors.email.message} />}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <InputError message={errors.password.message} />}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-3">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="mt-4 w-full" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Register
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
