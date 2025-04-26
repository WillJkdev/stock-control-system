import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { ProductsTemplate } from '@/components/templates/ProductsTemplate';
import { useBrandStore } from '@/store/BrandStore';
import { useCategoryStore } from '@/store/CategoryStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Products() {
  const {
    // showProducts,
    showProductsView,
    dataProducts,
    searchProduct,
    searcher,
  } = useProductStore();
  const { showBrands } = useBrandStore();
  const { showCategories } = useCategoryStore();
  const { dataCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  // Prefetch para productos
  // useEffect(() => {
  //   if (dataCompany?.id) {
  //     queryClient.prefetchQuery({
  //       queryKey: ['products', { company_id: dataCompany.id }],
  //       queryFn: () => showProducts({ company_id: Number(dataCompany.id) }),
  //     });
  //   }
  // }, [dataCompany?.id, queryClient, showProducts]);

  // Prefetch para productos vista
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['products_view', { _company_id: dataCompany.id }],
        queryFn: () => showProductsView({ _company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showProductsView]);

  // Prefetch para marcas
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['brands', { company_id: dataCompany.id }],
        queryFn: () => showBrands({ company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showBrands]);

  // Prefetch para categorías
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['categories', { company_id: dataCompany.id }],
        queryFn: () => showCategories({ company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showCategories]);

  // Consulta de productos
  // const { isLoading: isLoadingProducts, error: errorProducts } = useQuery({
  //   queryKey: ['mostrar productos', { company_id: dataCompany?.id }],
  //   queryFn: () => showProducts({ company_id: Number(dataCompany?.id) }),
  //   enabled: !!dataCompany?.id,
  //   staleTime: 1000 * 60 * 5, // 5 minutos
  //   gcTime: 1000 * 60 * 10, // 10 minutos
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // });

  // Consulta de productos vista
  const { isLoading: isLoadingProductsView, error: errorProductsView } = useQuery({
    queryKey: ['mostrar productos vista', { _company_id: dataCompany?.id }],
    queryFn: () => showProductsView({ _company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de marcas
  const { isLoading: isLoadingBrands, error: errorBrands } = useQuery({
    queryKey: ['mostrar marcas', { company_id: dataCompany?.id }],
    queryFn: () => showBrands({ company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de categorías
  const { isLoading: isLoadingCategories, error: errorCategories } = useQuery({
    queryKey: ['mostrar categorías', { company_id: dataCompany?.id }],
    queryFn: () => showCategories({ company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de búsqueda de productos
  useQuery({
    queryKey: ['buscar producto', { company_id: dataCompany?.id, description: searcher }],
    queryFn: () => searchProduct({ company_id: Number(dataCompany?.id), description: searcher }),
    enabled: !!dataCompany?.id && !!searcher,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showProductsView({ _company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showProductsView]);

  if (isLoadingProductsView || isLoadingBrands || isLoadingCategories) return <SpinnerLoader />;
  if (errorProductsView || errorBrands || errorCategories)
    return <div>Error: {errorProductsView?.message || errorBrands?.message || errorCategories?.message}</div>;

  return <ProductsTemplate dataProducts={dataProducts} />;
}
