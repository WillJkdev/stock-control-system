import { CategoryTable } from '@/components/organisms/tables/CategoryTable';
import Layout from '@/layouts/Layout';
import { Categories } from '@/types/types';

interface CategoriesTemplateProps {
  dataCategories: Categories[];
}

export function CategoriesTemplate({ dataCategories }: CategoriesTemplateProps) {
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Marcas</h1>
        <CategoryTable data={dataCategories} />
      </div>
    </Layout>
  );
}
