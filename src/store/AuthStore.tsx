import { supabase } from '@/supabase/supabase.config';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface SignInParams {
  email: string;
  password: string;
}

interface AuthStore {
  signInWithEmail: (params: SignInParams) => Promise<User | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(() => ({
  signInWithEmail: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return null;
    }

    console.log('Usuario autenticado:', data);
    return data.user;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Ha ocurrido un error al cerrar sesión.' + error);
    }
  },
}));
