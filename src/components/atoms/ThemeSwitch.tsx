import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';

export function ThemeSwitch() {
  const { setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  // Cargar el tema inicial desde localStorage o sistema
  useEffect(() => {
    const stored = localStorage.getItem('vite-ui-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(stored === 'dark' || (!stored && prefersDark));
  }, []);

  const handleToggle = (value: boolean) => {
    setIsDark(value);
    setTheme(value ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <div className="flex items-center gap-2">
        {isDark ? <Moon className="text-muted-foreground h-4 w-4" /> : <Sun className="text-muted-foreground h-4 w-4" />}
        <Label className="text-sm">Tema oscuro</Label>
      </div>
      <Switch checked={isDark} onCheckedChange={handleToggle} />
    </div>
  );
}
