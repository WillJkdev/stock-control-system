import { CompanyProfile } from '@/components/organisms/tables/CompanyProfile';
import Layout from '@/layouts/Layout';

export function CompanyTemplate() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Empresa</h1>
        <CompanyProfile />
      </div>
    </Layout>
  );
}
