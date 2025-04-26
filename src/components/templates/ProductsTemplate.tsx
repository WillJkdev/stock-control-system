import { ProductTable } from '@/components/organisms/tables/ProductTable';
import Layout from '@/layouts/Layout';
import { ProductsView } from '@/types/types';

interface ProductsTemplateProps {
  dataProducts: ProductsView[];
}

export function ProductsTemplate({ dataProducts }: ProductsTemplateProps) {
  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Productos</h1>
        <ProductTable data={dataProducts} />
      </div>
    </Layout>
  );
}
