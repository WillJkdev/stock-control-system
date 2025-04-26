import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { GridLoader } from 'react-spinners';

interface SmallGridLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function SmallGridLoader({ size = 'sm', className }: SmallGridLoaderProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    xs: 'scale-30', // 50% del tamaño original
    sm: 'scale-75', // 75% del tamaño original
    md: 'scale-100', // tamaño original
    lg: 'scale-125', // 125% del tamaño original
  };

  return (
    <div className={cn('flex transform-gpu items-center justify-center', sizeStyles[size], className)}>
      <GridLoader color={theme === 'dark' ? '#3B82F6' : '#2563EB'} size={15} margin={2} />
    </div>
  );
}
