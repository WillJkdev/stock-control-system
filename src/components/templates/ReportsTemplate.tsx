import Layout from '@/layouts/Layout';
import { Outlet } from 'react-router';

export function ReportsTemplate() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
