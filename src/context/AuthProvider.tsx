import { AuthContext } from '@/context/AuthContext'; // Importamos el contexto separado
import { supabase } from '@/supabase/supabase.config';
import { Session, User } from '@supabase/supabase-js';
import { ReactNode, useEffect, useState } from 'react';

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
      setUser(session?.user ?? null);
      setIsAuthChecked(true);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, isAuthChecked }}>{children}</AuthContext.Provider>;
};
