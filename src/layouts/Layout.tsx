import { DynamicBreadcrumb } from '@/components/molecules/DynamicBreadcrumb';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { myApp, routesConfig } from '@/config/routesConfig';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  const location = useLocation();
  const appName = myApp.name;
  const pageTitle = routesConfig[location.pathname as keyof typeof routesConfig] ?? 'Página no encontrada';
  useEffect(() => {
    document.title = `${pageTitle} | ${appName}`;
  }, [location, pageTitle, appName]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('vite-ui-theme');
    if (!storedTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  return (
    <SidebarProvider>
      {user && <AppSidebar />}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
