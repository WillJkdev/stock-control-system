import { countUserCompany, EditCompany, showCompanies, showCompany } from '@/supabase/crudCompany';
import { CompanyData } from '@/types/types';
import { create } from 'zustand';

interface CompanyStore {
  dataCompany: CompanyData | null;
  showCompany: (params: { id: number }) => Promise<CompanyData | null>;

  countUsers_company: number;
  countUserCompany: (params: { company_id: number }) => Promise<number>;

  dataCompanies: Partial<CompanyData>[];
  showCompaniesList: () => Promise<Partial<CompanyData>[]>;
  editCompany: (params: { user_admin_id: number; data: Partial<CompanyData> }) => Promise<boolean>;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  dataCompany: null,
  showCompany: async (params: { id: number }) => {
    const response = await showCompany(params);
    const companyDatas = response ?? null;
    set({ dataCompany: companyDatas });
    return companyDatas;
  },

  countUsers_company: 0,
  countUserCompany: async (params: { company_id: number }) => {
    // Verificación
    if (params.company_id === null || params.company_id === undefined) {
      console.warn('ID de empresa no proporcionado');
      return 0;
    }

    try {
      const response = await countUserCompany(params);
      set({ countUsers_company: response });
      return response;
    } catch (error) {
      console.error('Error en countUserCompany:', error);
      return 0;
    }
  },
  dataCompanies: [],
  showCompaniesList: async () => {
    const response = await showCompanies();
    set({ dataCompanies: response ?? [] });
    return response;
  },
  editCompany: async (params: { user_admin_id: number; data: Partial<CompanyData> }) => {
    const success = await EditCompany(params);
    if (success) {
      const { dataCompany } = get();
      set({
        dataCompany: {
          ...dataCompany!,
          ...params.data,
        },
      });
      return true;
    }
    return false;
  },
}));
