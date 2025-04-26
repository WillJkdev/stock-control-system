import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { KardexTemplate } from '@/components/templates/KardexTemplate';
import { useCompanyStore } from '@/store/CompanyStore';
import { useKardexStore } from '@/store/KardexStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Kardex() {
  const { showKardex, dataKardex, searchKardex, searcher } = useKardexStore();
  const { dataCompany } = useCompanyStore();
  const queryClient = useQueryClient();

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

  // Consulta de búsqueda de movimientos
  useQuery({
    queryKey: ['buscar movimientos', { company_id: dataCompany?.id, description: searcher }],
    queryFn: () => searchKardex({ company_id: Number(dataCompany?.id), description: searcher }),
    enabled: !!dataCompany?.id && !!searcher,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showKardex({ _company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showKardex]);

  if (isLoadingKardex) return <SpinnerLoader />;
  if (errorKardex) return <ErrorComponent message={errorKardex.message} />;

  return <KardexTemplate data={dataKardex} />;
}
