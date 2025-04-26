import { Settings } from '@/components/organisms/Settings';
import Layout from '@/layouts/Layout';

export function SettingsTemplate() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Configuración</h1>
        <Settings />
      </div>
    </Layout>
  );
}
