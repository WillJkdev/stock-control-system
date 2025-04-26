import { useTheme } from '@/hooks/useTheme';
import { AlertCircle } from 'lucide-react';

export function ErrorComponent({ message = 'Something went wrong' }) {
  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center">
      <AlertCircle
        className="mb-4"
        size={48}
        color={theme === 'dark' ? '#EF4444' : '#DC2626'} // Rojo en modo claro/oscuro
      />
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{message}</p>
    </div>
  );
}
