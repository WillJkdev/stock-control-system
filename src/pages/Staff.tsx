import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { StaffTemplate } from '@/components/templates/StaffTemplate';
import { useBrandStore } from '@/store/BrandStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { useUserStore } from '@/store/UserStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function Staff() {
  const { showAllUsers, searchUser, dataUsers, searcher, showModules } = useUserStore();
  const { showBrands } = useBrandStore();

  const { dataCompany, showCompaniesList } = useCompanyStore();

  const queryClient = useQueryClient();

  // Prefetch para usuarios
  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['users', { company_id: dataCompany.id }],
        queryFn: () => showAllUsers({ _company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showAllUsers]);

  // Consulta de usuarios
  const { isLoading, error } = useQuery({
    queryKey: ['mostrar users', { company_id: dataCompany?.id }],
    queryFn: () => showAllUsers({ _company_id: Number(dataCompany?.id) }),
    enabled: !!dataCompany?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Consulta de búsqueda
  useQuery({
    queryKey: ['buscar usuario', { company_id: dataCompany?.id, name: searcher }],
    queryFn: () => searchUser({ company_id: Number(dataCompany?.id), name: searcher }),
    enabled: !!dataCompany?.id && !!searcher,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showAllUsers({ _company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showAllUsers]);

  useEffect(() => {
    if (!searcher.trim() && dataCompany?.id) {
      showBrands({ company_id: Number(dataCompany.id) });
    }
  }, [searcher, dataCompany?.id, showBrands]);

  // consulta de módulos
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['mostrar modules'],
      queryFn: () => showModules(),
    });
  }, [queryClient, showModules]);

  const { isLoading: isLoadingModules, error: errorModules } = useQuery({
    queryKey: ['mostrar modules'],
    queryFn: () => showModules(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // consulta de compañías
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['mostrar lista companies'],
      queryFn: () => showCompaniesList(),
    });
  }, [queryClient, showCompaniesList]);

  const { isLoading: isLoadingCompanies, error: errorCompanies } = useQuery({
    queryKey: ['mostrar lista companies'],
    queryFn: () => showCompaniesList(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoadingModules || isLoading || isLoadingCompanies) return <SpinnerLoader />;
  if (errorModules || error || errorCompanies)
    return <div>Error: {error?.message || errorModules?.message || errorCompanies?.message}</div>;

  return <StaffTemplate dataStaff={dataUsers} />;
}
