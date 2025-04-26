import InputError from '@/components/atoms/InputError';
import TextLink from '@/components/atoms/TextLink';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/useTheme';
import AuthLayout from '@/layouts/AuthLayout';
import { useAuthStore } from '@/store/AuthStore';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginTemplate() {
  const { setTheme } = useTheme();
  const { signInWithEmail } = useAuthStore();
  const [stateStart, setStateStart] = useState(false);
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginFormData>();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  async function onSubmit(data: LoginFormData) {
    setProcessing(true);
    try {
      const response = await signInWithEmail(data);

      if (response) {
        console.log('Login exitoso');
        localStorage.removeItem('vite-ui-theme');
        navigate('/');
      } else {
        console.log('Login fallido, mostrando mensaje de error');
        setStateStart(true);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setStateStart(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AuthLayout title="Login" description="Sign in to your account">
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
              {...register('email', { required: 'Email is required' })}
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
            Log in
          </Button>
        </div>

        {/* Signup Link */}
        <div className="text-muted-foreground text-center text-sm">
          Don't have an account? <TextLink to="/register">Sign up</TextLink>
        </div>
      </form>
    </AuthLayout>
  );
}
