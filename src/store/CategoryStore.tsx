import { DeleteCategory, EditCategory, InsertCategory, SearchCategory, ShowCategories } from '@/supabase/crudCategories';
import { Categories } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/customToasts';
import { create } from 'zustand';

interface CategoryStoreState {
  searcher: string;
  setSearcher: (params: string) => void;
  dataCategories: Categories[];
  categoryItemSelect: Categories | null;
  parameters: { company_id: number };
  showCategories: (params: { company_id: number }) => Promise<Categories[]>;
  selectCategory: (params: Categories | null) => void;
  insertCategory: (params: { f_company_id: number; f_color: string; f_description: string }) => Promise<void>;
  deleteCategory: (params: { id: number }) => Promise<void>;
  editCategory: (params: { id: number; data: Partial<Categories> }) => Promise<void>;
  searchCategory: (params: { company_id: number; description: string }) => Promise<Categories[]>;
}

export const useCategoryStore = create<CategoryStoreState>((set, get) => ({
  searcher: '',
  setSearcher: (params) => {
    set({ searcher: params });
  },
  dataCategories: [],
  categoryItemSelect: null,
  parameters: { company_id: 0 },

  showCategories: async (params) => {
    const response = await ShowCategories(params);
    set({
      parameters: params,
      dataCategories: response ?? [],
      categoryItemSelect: response?.[0] ?? null,
    });
    return response;
  },
  selectCategory: (params: Categories | null) => {
    set({ categoryItemSelect: params });
  },
  insertCategory: async (params: { f_company_id: number; f_color: string; f_description: string }) => {
    const success = await InsertCategory(params);
    if (success) {
      const { showCategories, parameters } = get();
      const response = await showCategories(parameters);
      set({ dataCategories: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se guardaron correctamente');
    } else {
      console.error('No se pudo insertar la marca');
      showErrorToast('Operación fallida', 'Los datos no se guardaron correctamente');
    }
  },
  deleteCategory: async (params: { id: number }) => {
    const success = await DeleteCategory(params);
    if (success) {
      const { showCategories, parameters } = get();
      const response = await showCategories(parameters);
      set({ dataCategories: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se eliminaron correctamente');
    } else {
      console.error('No se pudo eliminar la marca');
      showErrorToast('Operación fallida', 'Los datos no se eliminaron correctamente');
    }
  },
  editCategory: async (params: { id: number; data: Partial<Categories> }) => {
    const success = await EditCategory({ id: params.id, data: params.data });
    if (success) {
      const { showCategories, parameters } = get();
      const response = await showCategories(parameters);
      set({ dataCategories: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se editaron correctamente');
    } else {
      console.error('No se pudo editar la marca');
      showErrorToast('Operación fallida', 'Los datos no se editaron correctamente');
    }
  },
  searchCategory: async (params: { company_id: number; description: string }) => {
    if (!params.description.trim()) {
      const { showCategories } = get();
      const response = await showCategories({ company_id: params.company_id });
      return response;
    }

    const response = await SearchCategory(params);
    set({ dataCategories: response ?? [] });
    return response;
  },
}));
