import { supabase } from '@/supabase/supabase.config';
import { Brands } from '@/types/types';

export async function InsertBrand(params: { f_company_id: number; f_description: string }): Promise<boolean> {
  const { error } = await supabase.rpc('insert_brands', params);
  if (error) {
    console.error('Error al insertar marca:', error.message);
    return false;
  }
  return true;
}

export async function ShowBrands(params: { company_id: number }): Promise<Brands[]> {
  const { data, error } = await supabase.from('brands').select().eq('company_id', params.company_id).order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener marcas:', error.message);
    return [];
  }

  return data || [];
}

export async function DeleteBrand(params: { id: number }): Promise<boolean> {
  const { error } = await supabase.from('brands').delete().eq('id', params.id);
  if (error) {
    console.error('Error al eliminar marca:', error.message);
    return false;
  }
  return true;
}

export async function EditBrand(params: { id: number; data: Partial<Brands> }): Promise<boolean> {
  const { error } = await supabase.from('brands').update(params.data).eq('id', params.id);
  if (error) {
    console.error('Error al editar marca:', error.message);
    return false;
  }
  return true;
}
export async function SearchBrand(params: { company_id: number; description: string }): Promise<Brands[]> {
  let query = supabase.from('brands').select().eq('company_id', params.company_id);

  if (params.description && params.description.trim() !== '') {
    query = query.ilike('description', `%${params.description}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al buscar marcas:', error.message);
    return [];
  }

  return data ?? [];
}
