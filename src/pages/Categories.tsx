import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { CategoriesTemplate } from '@/components/templates/CategoriesTemplate';
import { useCategoryStore } from '@/store/CategoryStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Categories() {
  const { showCategories, dataCategories, searchCategory, searcher } = useCategoryStore();
  const { dataCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  // Prefetch para categorías
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['categories', { company_id: dataCompany.id }],
        queryFn: () => showCategories({ company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showCategories]);

  // Consulta de categorías
  const { isLoading, error } = useQuery({
    queryKey: ['mostrar categorías', { company_id: dataCompany?.id }],
    queryFn: () => showCategories({ company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de búsqueda de categorías
  useQuery({
    queryKey: ['buscar categoría', { company_id: dataCompany?.id, description: searcher }],
    queryFn: () => searchCategory({ company_id: Number(dataCompany?.id), description: searcher }),
    enabled: !!dataCompany?.id && !!searcher,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showCategories({ company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showCategories]);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Error: {error.message}</div>;

  return <CategoriesTemplate dataCategories={dataCategories} />;
}
