import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { useCompanyStore } from '@/store/CompanyStore';
import { useKardexStore } from '@/store/KardexStore';
import { useProductStore } from '@/store/ProductStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Home() {
  const { countUserCompany, dataCompany } = useCompanyStore();
  const { showProductsView } = useProductStore();
  const { showKardex } = useKardexStore();

  const queryClient = useQueryClient();

  // Prefetch para categorías
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['categories', { company_id: dataCompany.id }],
        queryFn: () => countUserCompany({ company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, countUserCompany]);

  useQuery({
    queryKey: ['contar usuarios por empresa', dataCompany?.id],
    queryFn: async () => {
      if (!dataCompany?.id) {
        throw new Error('No company data available');
      }

      try {
        const count = await countUserCompany({ company_id: Number(dataCompany.id) });
        return count ?? 0;
      } catch (error) {
        console.error('Error counting company users:', error);
        return 0;
      }
    },
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Prefetch para productos vista
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['products_view', { _company_id: dataCompany.id }],
        queryFn: () => showProductsView({ _company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showProductsView]);

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

  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['mostrar kardex', { _company_id: dataCompany.id }],
        queryFn: () => showKardex({ _company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showKardex]);

  const { isLoading: isLoadingKardex, error: errorKardex } = useQuery({
    queryKey: ['mostrar kardex', { _company_id: dataCompany?.id }],
    queryFn: () => showKardex({ _company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoadingProductsView || isLoadingKardex) return <SpinnerLoader />;
  if (errorProductsView || errorKardex) return <ErrorComponent message={errorProductsView?.message || errorKardex?.message} />;
  return <HomeTemplate />;
}
