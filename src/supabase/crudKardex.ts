import { supabase } from '@/supabase/supabase.config';
import { Kardex, KardexView } from '@/types/types';

export async function ShowKardex(params: { _company_id: number }): Promise<Partial<KardexView>[]> {
  const { data, error } = await supabase.rpc('show_kardex', params);

  if (error) {
    console.error('Error al obtener kardex:', error);
    return [];
  }

  return data || [];
}

export async function InsertKardex(params: Partial<Kardex>): Promise<boolean> {
  const { error } = await supabase.from('kardex').insert(params);
  if (error) {
    console.error('Error al insertar marca:', error.message);
    return false;
  }
  return true;
}

export async function DeleteKardex(params: { id: number }): Promise<boolean> {
  const { data, error: selectError } = await supabase.from('kardex').select('status').eq('id', params.id).single();

  if (selectError) {
    console.error('Error al verificar el status del kardex:', selectError.message);
    return false;
  }

  if (!data?.status) {
    console.error('El kardex ya está anulado');
    return false;
  }

  const { error } = await supabase
    .from('kardex')
    .update({
      date: new Date().toISOString(),
      status: false,
      details: 'Movimiento anulado',
    })
    .eq('id', params.id)
    .eq('status', true);

  if (error) {
    console.error('Error al marcar como eliminado el kardex:', error.message);
    return false;
  }
  return true;
}

export async function SearchKardex(params: { company_id: number; description: string }) {
  const { data, error } = await supabase.rpc('search_kardex', {
    _company_id: params.company_id,
    searcher: params.description,
  });

  if (error) {
    console.error('Error buscando kardex:', error.message);
    return [];
  }

  return data ?? [];
}
