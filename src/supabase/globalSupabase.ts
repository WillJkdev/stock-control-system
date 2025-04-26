import { supabase } from '@/supabase/supabase.config';

export const getAuthIdSupabase = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session != null) {
    const { user } = session;
    const auth_id_supabase = user.id;
    return auth_id_supabase;
  }
};
