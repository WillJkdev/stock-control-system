import { DeleteKardex, InsertKardex, SearchKardex, ShowKardex } from '@/supabase/crudKardex';
import { Kardex, KardexView } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/customToasts';
import { create } from 'zustand';

interface KardexStoreState {
  searcher: string;
  setSearcher: (params: string) => void;
  dataKardex: Partial<KardexView>[];
  parameters: { _company_id: number };
  brandItemSelect: Kardex | null;
  showKardex: (params: { _company_id: number }) => Promise<Partial<KardexView>[]>;
  insertKardex: (params: Partial<Kardex>) => Promise<void>;
  editKardex: (params: { id: number; data: Partial<Kardex> }) => Promise<void>;
  deleteKardex: (params: { id: number }) => Promise<void>;
  searchKardex: (params: { company_id: number; description: string }) => Promise<Partial<KardexView>[]>;
}

export const useKardexStore = create<KardexStoreState>((set, get) => ({
  searcher: '',
  setSearcher: (params) => {
    set({ searcher: params });
  },
  parameters: { _company_id: 0 },
  dataKardex: [],
  brandItemSelect: null,

  showKardex: async (params) => {
    const response = await ShowKardex(params);
    set({
      parameters: params,
      dataKardex: response ?? [],
    });
    return response;
  },
  insertKardex: async (params) => {
    const success = await InsertKardex(params);
    if (success) {
      const { showKardex, parameters } = get();
      const response = await showKardex(parameters);
      set({ dataKardex: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se guardaron correctamente');
    } else {
      console.error('No se pudo insertar la marca');
      showErrorToast('Operación fallida', 'Los datos no se guardaron correctamente');
    }
  },
  editKardex: async (params: { id: number; data: Partial<Kardex> }) => {
    console.log(params);
  },

  deleteKardex: async (params: { id: number }) => {
    const success = await DeleteKardex(params);
    if (success) {
      const { showKardex, parameters } = get();
      const response = await showKardex(parameters);
      set({ dataKardex: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se eliminaron correctamente');
    } else {
      console.error('No se pudo eliminar la marca');
      showErrorToast('Operación fallida', 'Los datos no se eliminaron correctamente');
    }
  },

  searchKardex: async (params: { company_id: number; description: string }) => {
    if (!params.description.trim()) {
      const { showKardex } = get();
      const response = await showKardex({ _company_id: params.company_id });
      return response;
    }

    const response = await SearchKardex(params);
    set({ dataKardex: response ?? [] });
    return response;
  },
}));
