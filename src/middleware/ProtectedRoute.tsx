import { PageRestriction } from '@/components/molecules/PageRestriction';
import { useUserStore } from '@/store/UserStore';
import { User } from '@supabase/supabase-js';
import { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

interface ProtectedRouteProps {
  user: User | null;
  isAuthChecked: boolean;
  redirectTo: string;
  children?: ReactNode;
}

export const ProtectedRoute = ({ user, isAuthChecked, redirectTo, children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { dataModulesConfigWithState } = useUserStore();

  if (!isAuthChecked) return null;
  if (!user) return <Navigate replace to={redirectTo} state={{ from: location }} />;

  const currentPath = location.pathname;

  const alwaysAllowed = ['/', '/settings'];
  if (alwaysAllowed.includes(currentPath)) {
    return children ? children : <Outlet />;
  }

  const isRestricted = dataModulesConfigWithState?.some((mod) => mod.link === currentPath && mod.state === false) ?? false;
  if (isRestricted) return <PageRestriction />;

  // Todas las demás rutas no listadas o permitidas están accesibles
  return children ? children : <Outlet />;
};
