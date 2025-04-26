import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import CurrentStockProduct from '@/components/organisms/reports/CurrentStockProduct';
import LowStockReport from '@/components/organisms/reports/LowStockReport';
import MovementsReport from '@/components/organisms/reports/MovementsReport';
import TotalCurrentStock from '@/components/organisms/reports/TotalCurrentStock';
import ValuedInventoryReport from '@/components/organisms/reports/ValuedInventoryReport';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/middleware/ProtectedRoute';
import { PublicRoute } from '@/middleware/PublicRoute';
import { Brands } from '@/pages/Brands';
import { Categories } from '@/pages/Categories';
import { Company } from '@/pages/Company';
import { Home } from '@/pages/Home';
import { Kardex } from '@/pages/Kardex';
import { Login } from '@/pages/Login';
import { Products } from '@/pages/Products';
import { Register } from '@/pages/Register';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Staff } from '@/pages/Staff';
import { useCompanyStore } from '@/store/CompanyStore';
import { useUserStore } from '@/store/UserStore';
import { useQuery } from '@tanstack/react-query';
import { Route, Routes } from 'react-router';
export function AppRoutes() {
  const { user, isAuthChecked } = useAuth();

  const { showUsers, userId } = useUserStore();
  const {
    data: dataUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ['mostrar usuarios'],
    queryFn: showUsers,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { showCompany, dataCompany } = useCompanyStore();

  const { isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ['mostrar empresa'],
    queryFn: () => showCompany({ id: userId }),
    enabled: !!dataUsers && !!userId && !dataCompany,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { showPermissions } = useUserStore();

  const { isLoading: isLoadingPermissions, error: permissionsError } = useQuery({
    queryKey: ['mostrar permisos', userId],
    queryFn: () => showPermissions({ id: userId }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoadingPermissions) return <SpinnerLoader />;
  if (permissionsError) return <ErrorComponent message={permissionsError.message} />;

  if (isLoadingUsers || isLoadingCompany) return <SpinnerLoader />;
  if (usersError) return <ErrorComponent message={usersError.message} />;
  if (companyError) return <ErrorComponent message={companyError.message} />;

  return (
    <Routes>
      <Route element={<PublicRoute user={user} isAuthChecked={isAuthChecked} redirectTo="/" />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute user={user} isAuthChecked={isAuthChecked} redirectTo="/login" />}>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/brands" element={<Brands />} />
        <Route path="/settings/categories" element={<Categories />} />
        <Route path="/settings/products" element={<Products />} />
        <Route path="/settings/staff" element={<Staff />} />
        <Route path="/settings/company" element={<Company />} />
        <Route path="/kardex" element={<Kardex />} />
        <Route path="/reports" element={<Reports />}>
          <Route path="total-current-stock" element={<TotalCurrentStock />} />
          <Route path="current-stock-product" element={<CurrentStockProduct />} />
          <Route path="low-stock-report" element={<LowStockReport />} />
          <Route path="movements-report" element={<MovementsReport />} />
          <Route path="valued-inventory-report" element={<ValuedInventoryReport />} />
        </Route>
      </Route>
    </Routes>
  );
}
