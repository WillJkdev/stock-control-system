import { StaffTable } from '@/components/organisms/tables/StaffTable';
import Layout from '@/layouts/Layout';
import { Users } from '@/types/types';

interface StaffTemplateProps {
  dataStaff: Users[];
}

export function StaffTemplate({ dataStaff }: StaffTemplateProps) {
  return (
    <Layout>
      <div className="container mx-auto max-w-11/12 px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Usuarios</h1>
        <StaffTable data={dataStaff} />
      </div>
    </Layout>
  );
}
