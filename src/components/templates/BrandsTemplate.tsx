import { BrandTable } from '@/components/organisms/tables/BrandTable';
import Layout from '@/layouts/Layout';
import { Brands } from '@/types/types';

interface BrandsTemplateProps {
  dataBrands: Brands[];
}

export function BrandsTemplate({ dataBrands }: BrandsTemplateProps) {
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Marcas</h1>
        <BrandTable data={dataBrands} />
      </div>
    </Layout>
  );
}
