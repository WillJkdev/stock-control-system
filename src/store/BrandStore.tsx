import { DeleteBrand, EditBrand, InsertBrand, SearchBrand, ShowBrands } from '@/supabase/crudBrands';
import { Brands } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/customToasts';
import { create } from 'zustand';

interface BrandStoreState {
  searcher: string;
  setSearcher: (params: string) => void;
  dataBrands: Brands[];
  brandItemSelect: Brands | null;
  parameters: { company_id: number };
  showBrands: (params: { company_id: number }) => Promise<Brands[]>;
  selectBrand: (params: Brands | null) => void;
  insertBrand: (params: { f_company_id: number; f_description: string }) => Promise<void>;
  deleteBrand: (params: { id: number }) => Promise<void>;
  editBrand: (params: { id: number; data: Partial<Brands> }) => Promise<void>;
  searchBrand: (params: { company_id: number; description: string }) => Promise<Brands[]>;
}

export const useBrandStore = create<BrandStoreState>((set, get) => ({
  searcher: '',
  setSearcher: (params) => {
    set({ searcher: params });
  },
  dataBrands: [],
  brandItemSelect: null,
  parameters: { company_id: 0 },

  showBrands: async (params) => {
    const response = await ShowBrands(params);
    set({
      parameters: params,
      dataBrands: response ?? [],
      brandItemSelect: response?.[0] ?? null,
    });
    return response;
  },
  selectBrand: (params: Brands | null) => {
    set({ brandItemSelect: params });
  },
  insertBrand: async (params: { f_company_id: number; f_description: string }) => {
    const success = await InsertBrand(params);
    if (success) {
      const { showBrands, parameters } = get();
      const response = await showBrands(parameters);
      set({ dataBrands: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se guardaron correctamente');
    } else {
      console.error('No se pudo insertar la marca');
      showErrorToast('Operación fallida', 'Los datos no se guardaron correctamente');
    }
  },
  deleteBrand: async (params: { id: number }) => {
    const success = await DeleteBrand(params);
    if (success) {
      const { showBrands, parameters } = get();
      const response = await showBrands(parameters);
      set({ dataBrands: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se eliminaron correctamente');
    } else {
      console.error('No se pudo eliminar la marca');
      showErrorToast('Operación fallida', 'Los datos no se eliminaron correctamente');
    }
  },
  editBrand: async (params: { id: number; data: Partial<Brands> }) => {
    const success = await EditBrand({ id: params.id, data: params.data });
    if (success) {
      const { showBrands, parameters } = get();
      const response = await showBrands(parameters);
      set({ dataBrands: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se editaron correctamente');
    } else {
      console.error('No se pudo editar la marca');
      showErrorToast('Operación fallida', 'Los datos no se editaron correctamente');
    }
  },
  searchBrand: async (params: { company_id: number; description: string }) => {
    if (!params.description.trim()) {
      const { showBrands } = get();
      const response = await showBrands({ company_id: params.company_id });
      return response;
    }
    const response = await SearchBrand(params);
    set({ dataBrands: response ?? [] });
    return response;
  },
}));
