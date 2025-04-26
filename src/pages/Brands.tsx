import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { BrandsTemplate } from '@/components/templates/BrandsTemplate';
import { useBrandStore } from '@/store/BrandStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Brands() {
  const { showBrands, dataBrands, searchBrand, searcher } = useBrandStore();
  const { dataCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  // Prefetch para marcas
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['brands', { company_id: dataCompany.id }],
        queryFn: () => showBrands({ company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showBrands]);

  // Consulta de marcas
  const { isLoading, error } = useQuery({
    queryKey: ['mostrar marcas', { company_id: dataCompany?.id }],
    queryFn: () => showBrands({ company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de búsqueda
  useQuery({
    queryKey: ['buscar marca', { company_id: dataCompany?.id, description: searcher }],
    queryFn: () => searchBrand({ company_id: Number(dataCompany?.id), description: searcher }),
    enabled: !!dataCompany?.id && !!searcher,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showBrands({ company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showBrands]);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Error: {error.message}</div>;

  return <BrandsTemplate dataBrands={dataBrands} />;
}
