import { supabase } from '@/supabase/supabase.config';
import { functionProduct, ProductReport, Products, ProductsView } from '@/types/types';

export async function InsertProduct(params: functionProduct): Promise<boolean> {
  const { error } = await supabase.rpc('insert_products', params);
  if (error) {
    console.error('Error al insertar producto:', error.message);
    return false;
  }
  return true;
}

export async function ShowProducts(params: { company_id: number }): Promise<ProductsView[]> {
  const { data, error } = await supabase.from('products').select().eq('company_id', params.company_id).order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener productos:', error.message);
    return [];
  }

  return data || [];
}

export async function ShowProductsView(params: { _company_id: number }): Promise<ProductsView[]> {
  const { data, error } = await supabase.rpc('show_products', params);

  if (error) {
    console.error('Error al obtener productos:', error.message);
    return [];
  }

  return data || [];
}

export async function DeleteProduct(params: { id: number }): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', params.id);
  if (error) {
    console.error('Error al eliminar producto:', error.message);
    return false;
  }
  return true;
}

export async function EditProduct(params: { id: number; data: Partial<Products> }): Promise<boolean> {
  const { error } = await supabase.from('products').update(params.data).eq('id', params.id);
  if (error) {
    console.error('Error al editar producto:', error.message);
    return false;
  }
  return true;
}
export async function SearchProduct(params: { company_id: number; description: string }): Promise<ProductsView[]> {
  let query = supabase.from('products').select().eq('company_id', params.company_id);

  if (params.description && params.description.trim() !== '') {
    query = query.ilike('description', `%${params.description}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al buscar productos:', error.message);
    return [];
  }

  return data ?? [];
}

//REPORTES
export async function ShowAllProductsReport(params: { company_id: number }): Promise<Partial<Products>[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id,description,stock,stock_min')
    .eq('company_id', params.company_id)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener productos:', error.message);
    return [];
  }

  return data || [];
}

export async function ValuedInventory(params: { company_id: number; product?: string }): Promise<Partial<ProductReport>[]> {
  const { data, error } = await supabase.rpc('valued_inventory', {
    _company_id: params.company_id,
    _searcher: params.product,
  });

  if (error) {
    console.error('Error al obtener productos:', error.message);
    return [];
  }

  return data || [];
}
