import { MovementTable } from '@/components/organisms/tables/KardexTable';
import Layout from '@/layouts/Layout';
import { KardexView } from '@/types/types';

interface KardexTemplateProps {
  data: Partial<KardexView>[];
}
export function KardexTemplate({ data }: KardexTemplateProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Kardex</h1>
        <MovementTable movements={data} />
      </div>
    </Layout>
  );
}
