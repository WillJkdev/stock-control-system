import {
  DeleteProduct,
  EditProduct,
  InsertProduct,
  SearchProduct,
  ShowAllProductsReport,
  ShowProducts,
  ShowProductsView,
  ValuedInventory,
} from '@/supabase/crudProducts';
import { functionProduct, ProductReport, Products, ProductsView } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/customToasts';
import { create } from 'zustand';

interface ProductStoreState {
  searcher: string;
  setSearcher: (params: string) => void;
  dataProducts: ProductsView[];
  productItemSelect: Products | null;
  parameters: { company_id: number };
  parametersView: { _company_id: number };
  showProducts: (params: { company_id: number }) => Promise<Products[]>;
  showProductsView: (params: { _company_id: number }) => Promise<ProductsView[]>;
  selectProduct: (params: Products | null) => void;
  insertProduct: (params: functionProduct) => Promise<void>;
  deleteProduct: (params: { id: number }) => Promise<void>;
  editProduct: (params: { id: number; data: Partial<Products> }) => Promise<void>;
  searchProduct: (params: { company_id: number; description: string }) => Promise<ProductsView[]>;
  reportProducts: (params: { company_id: number }) => Promise<Partial<Products>[]>;
  reportValuedInventory: (params: { company_id: number; product: string }) => Promise<Partial<ProductReport>[]>;
}

export const useProductStore = create<ProductStoreState>((set, get) => ({
  searcher: '',
  setSearcher: (params) => {
    set({ searcher: params });
  },
  dataProducts: [],
  productItemSelect: null,
  parameters: { company_id: 0 },
  parametersView: { _company_id: 0 },

  showProducts: async (params) => {
    const response = await ShowProducts(params);
    set({
      parameters: params,
      dataProducts: response ?? [],
      productItemSelect: response?.[0] ?? null,
    });
    return response;
  },
  showProductsView: async (params) => {
    const response = await ShowProductsView(params);
    set({
      parametersView: params,
      dataProducts: response ?? [],
      productItemSelect: response?.[0] ?? null,
    });
    return response;
  },
  selectProduct: (params: Products | null) => {
    set({ productItemSelect: params });
  },
  insertProduct: async (params: functionProduct) => {
    const success = await InsertProduct(params);
    if (success) {
      // const { showProducts, parameters } = get();
      // const response = await showProducts(parameters);
      const { showProductsView, parametersView } = get();
      const response = await showProductsView(parametersView);

      set({ dataProducts: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se guardaron correctamente');
    } else {
      console.error('No se pudo insertar la marca');
      showErrorToast('Operación fallida', 'Los datos no se guardaron correctamente');
    }
  },
  deleteProduct: async (params: { id: number }) => {
    const success = await DeleteProduct(params);
    if (success) {
      // const { showProducts, parameters } = get();
      // const response = await showProducts(parameters);
      const { showProductsView, parametersView } = get();
      const response = await showProductsView(parametersView);

      set({ dataProducts: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se eliminaron correctamente');
    } else {
      console.error('No se pudo eliminar la marca');
      showErrorToast('Operación fallida', 'Los datos no se eliminaron correctamente');
    }
  },
  editProduct: async (params: { id: number; data: Partial<Products> }) => {
    const success = await EditProduct({ id: params.id, data: params.data });
    if (success) {
      // const { showProducts, parameters } = get();
      // const response = await showProducts(parameters);
      const { showProductsView, parametersView } = get();
      const response = await showProductsView(parametersView);

      set({ dataProducts: response ?? [] });
      showSuccessToast('Operación exitosa', 'Los datos se editaron correctamente');
    } else {
      console.error('No se pudo editar la marca');
      showErrorToast('Operación fallida', 'Los datos no se editaron correctamente');
    }
  },
  searchProduct: async (params: { company_id: number; description: string }) => {
    if (!params.description.trim()) {
      const { showProductsView } = get();
      const response = await showProductsView({ _company_id: params.company_id });
      return response;
    }

    const response = await SearchProduct(params);
    set({ dataProducts: response ?? [] });
    return response;
  },
  //REPORTES
  reportProducts: async (params: { company_id: number }) => {
    const response = await ShowAllProductsReport(params);
    return response;
  },
  reportValuedInventory: async (params: { company_id: number; product: string }) => {
    if (!params.product.trim()) {
      const response = await ValuedInventory({ company_id: params.company_id });
      return response;
    }

    const response = await ValuedInventory(params);
    return response;
  },
}));
