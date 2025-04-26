import { KardexActivity } from '@/components/molecules/KardexActivity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/layouts/Layout';
import { useCompanyStore } from '@/store/CompanyStore';
import { useKardexStore } from '@/store/KardexStore';
import { useProductStore } from '@/store/ProductStore';
import { Activity, Building2, DollarSign, Package, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function HomeTemplate() {
  const { dataCompany, countUsers_company } = useCompanyStore();
  const { dataKardex } = useKardexStore();
  const { dataProducts: json } = useProductStore();
  const data = json.map((item) => ({
    name: item.description,
    Stock: item.stock,
    Mínimo: item.stock_min,
  }));
  return (
    <Layout>
      <div className="min-h-screen dark:bg-black dark:text-white">
        {/* Header */}
        <header className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">StockPRO</h1>
          </div>
          <div className="text-xl font-semibold">Tu empresa</div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4">
          {/* Dashboard Header */}
          <div className="relative mb-8 text-center">
            <div className="bg-grid-white/[0.05] absolute inset-0 -z-10" />
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                <h2 className="text-3xl font-bold">{dataCompany?.name}</h2>
              </div>
              <p className="text-gray-400">StockPRO te mantiene siempre informado.</p>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gray-800 dark:bg-gray-900 dark:text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm dark:font-normal dark:text-gray-400">Moneda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dataCompany?.currency_symbol}</div>
                  <DollarSign className="h-5 w-5 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 dark:bg-gray-900 dark:text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm dark:font-normal dark:text-gray-400">Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{countUsers_company}</div>
                  <Users className="h-5 w-5 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 dark:bg-gray-900 dark:text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm dark:font-normal dark:text-gray-400">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{json?.length}</div>
                  <Package className="h-5 w-5 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 md:col-span-2 lg:col-span-3 dark:bg-gray-900 dark:text-white">
              <CardHeader>
                <CardTitle>Resumen de Inventario</CardTitle>
                <CardDescription className="text-gray-400">Actividad reciente del inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" width={600} height={400} data={data}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="Stock" fill="#3b82f6" />
                    <Bar dataKey="Mínimo" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activity Section */}
          <div className="mt-8">
            <Card className="border-gray-800 dark:bg-gray-900 dark:text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Actividad Reciente</CardTitle>
                  <Activity className="h-5 w-5 text-gray-500" />
                </div>
                <CardDescription className="text-gray-400">Movimientos recientes del inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <KardexActivity movements={dataKardex} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
}
