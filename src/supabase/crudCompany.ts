import { supabase } from '@/supabase/supabase.config';
import { CompanyData } from '@/types/types';

export const showCompany = async (params: { id: number }): Promise<CompanyData | null> => {
  const { data, error } = await supabase
    .from('company_assignment')
    .select(`company(id,name,currency_symbol)`)
    .eq('user_id', params.id)
    .maybeSingle(); // Asegura que solo se devuelva un único registro

  if (error || !data?.company) {
    console.error('Error al mostrar la empresa:', error?.message);
    return null;
  }

  return Array.isArray(data.company) ? data.company[0] : data.company;
};

export const countUserCompany = async (params: { company_id: number }): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('count_user_company', {
      id_company: params.company_id,
    });

    if (error) throw new Error(error.message);
    return data ?? 0;
  } catch (err) {
    console.error(`Error en countUserCompany para empresa ${params.company_id}:`, err);
    return 0;
  }
};

export const showCompanies = async (): Promise<Partial<CompanyData>[]> => {
  const { data, error } = await supabase.from('company').select(`id,name`);
  if (error) {
    console.error('Error al mostrar las empresas:', error.message);
    return [];
  }
  return data || [];
};

export const EditCompany = async (params: { user_admin_id: number; data: Partial<CompanyData> }): Promise<boolean> => {
  const { error } = await supabase.from('company').update(params.data).eq('id', params.user_admin_id);
  if (error) {
    console.error('Error al editar la empresa:', error.message);
    return false;
  }
  return true;
};
