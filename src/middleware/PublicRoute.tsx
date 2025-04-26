import { User } from '@supabase/supabase-js';
import { Navigate, Outlet } from 'react-router';

interface PublicRouteProps {
  user: User | null;
  isAuthChecked: boolean;
  redirectTo: string;
}

export const PublicRoute = ({ user, isAuthChecked, redirectTo }: PublicRouteProps) => {
  if (!isAuthChecked) return null;
  if (user) return <Navigate replace to={redirectTo} />;

  return <Outlet />;
};
