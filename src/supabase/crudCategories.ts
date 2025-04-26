import { supabase } from '@/supabase/supabase.config';
import { Categories } from '@/types/types';

export async function InsertCategory(params: { f_company_id: number; f_color: string; f_description: string }): Promise<boolean> {
  const { error } = await supabase.rpc('insert_categories', params);
  if (error) {
    console.error('Error al insertar categoría:', error.message);
    return false;
  }
  return true;
}

export async function ShowCategories(params: { company_id: number }): Promise<Categories[]> {
  const { data, error } = await supabase.from('categories').select().eq('company_id', params.company_id).order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías:', error.message);
    return [];
  }

  return data || [];
}

export async function DeleteCategory(params: { id: number }): Promise<boolean> {
  const { error } = await supabase.from('categories').delete().eq('id', params.id);
  if (error) {
    console.error('Error al eliminar categoría:', error.message);
    return false;
  }
  return true;
}

export async function EditCategory(params: { id: number; data: Partial<Categories> }): Promise<boolean> {
  const { error } = await supabase.from('categories').update(params.data).eq('id', params.id);
  if (error) {
    console.error('Error al editar categoría:', error.message);
    return false;
  }
  return true;
}
export async function SearchCategory(params: { company_id: number; description: string }): Promise<Categories[]> {
  let query = supabase.from('categories').select().eq('company_id', params.company_id);

  if (params.description && params.description.trim() !== '') {
    query = query.ilike('description', `%${params.description}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al buscar categorías:', error.message);
    return [];
  }

  return data ?? [];
}
