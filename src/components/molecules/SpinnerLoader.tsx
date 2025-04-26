import { useTheme } from '@/hooks/useTheme';
import { FadeLoader } from 'react-spinners';

export function SpinnerLoader() {
  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <FadeLoader
        color={theme === 'dark' ? '#3B82F6' : '#2563EB'}
        height={20} // Más grande (default: 15)
        width={7} // Más grueso (default: 5)
        radius={3} // Bordes más suaves (default: 2)
        margin={3} // Espacio entre barras
      />
    </div>
  );
}
