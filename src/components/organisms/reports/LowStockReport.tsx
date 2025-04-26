import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import type { Products } from '@/types/types';
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Download, Printer } from 'lucide-react';

// Registrar fuentes
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    color: '#b91c1c', // Rojo oscuro para el título
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 5,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  alertBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    color: '#b91c1c',
  },
  alertText: {
    fontSize: 12,
    color: '#b91c1c',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    color: '#b91c1c',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 15,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 35,
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: '#b91c1c',
    fontWeight: 700,
  },
  tableRowEven: {
    backgroundColor: '#fef2f2',
  },
  tableCol: {
    padding: 8,
    fontSize: 10,
  },
  tableColHeader: {
    fontWeight: 700,
    color: '#ffffff',
  },
  tableColId: {
    width: '15%',
  },
  tableColDescription: {
    width: '45%',
  },
  tableColStock: {
    width: '20%',
    textAlign: 'center',
  },
  tableColStockMin: {
    width: '20%',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#b91c1c',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#b91c1c',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginBottom: 3,
  },
  stockLow: {
    color: '#dc2626',
    fontWeight: 700,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 5,
  },
  statBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: '30%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 5,
    color: '#b91c1c',
  },
  statLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#6b7280',
  },
  actionNeeded: {
    fontSize: 12,
    fontWeight: 700,
    color: '#b91c1c',
    marginBottom: 5,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityHigh: {
    backgroundColor: '#dc2626',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
  },
  priorityIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  priorityText: {
    fontSize: 10,
    color: '#4b5563',
  },
});

function LowStockReport() {
  const { reportProducts } = useProductStore();
  const { dataCompany } = useCompanyStore();

  const { data, isLoading, error } = useQuery<Partial<Products>[]>({
    queryKey: ['report-products', { company_id: dataCompany?.id }],
    queryFn: () => reportProducts({ company_id: Number(dataCompany?.id) }),
  });

  if (isLoading) return <SpinnerLoader />;
  if (error) return <ErrorComponent message={error.message} />;

  // Filtrar productos con stock bajo
  const lowStockProducts = data?.filter((producto) => (producto.stock ?? 0) < (producto.stock_min ?? 0)) || [];

  // Calcular estadísticas
  const totalLowStock = lowStockProducts.length;
  const criticalStock = lowStockProducts.filter((p) => (p.stock ?? 0) < (p.stock_min ?? 0) * 0.5).length;
  const percentageOfTotal = data?.length ? Math.round((totalLowStock / data.length) * 100) : 0;

  // Calcular prioridad de reposición
  const getRestockPriority = (product: Partial<Products>) => {
    const currentStock = product.stock ?? 0;
    const minStock = product.stock_min ?? 1;
    const ratio = currentStock / minStock;

    if (ratio === 0) return 'crítica'; // Sin stock
    if (ratio < 0.5) return 'alta'; // Menos del 50% del mínimo
    return 'media'; // Entre 50% y 100% del mínimo
  };

  // Formatear fecha actual
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-red-700">Reporte de Bajo Stock</h2>
            <p className="text-gray-600">
              {totalLowStock} productos requieren reposición ({percentageOfTotal}% del inventario total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Descargar PDF</span>
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="text-2xl font-bold text-red-700">{totalLowStock}</div>
            <div className="text-sm text-gray-600">Productos con bajo stock</div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="text-2xl font-bold text-red-700">{criticalStock}</div>
            <div className="text-sm text-gray-600">Productos en estado crítico</div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="text-2xl font-bold text-red-700">{percentageOfTotal}%</div>
            <div className="text-sm text-gray-600">Del inventario total</div>
          </div>
        </div>

        {totalLowStock > 0 && (
          <div className="mb-6 rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Se requiere atención inmediata para reponer los productos con bajo stock. Algunos productos han alcanzado niveles
                  críticos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <PDFViewer
        className="rounded-lg shadow-md"
        style={{
          width: '100%',
          height: '80vh',
          border: 'none',
        }}
      >
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Reporte de Bajo Stock</Text>
                  <Text style={styles.subtitle}>
                    {dataCompany?.name || 'Empresa'} - Listado de productos que necesitan ser reabastecidos
                  </Text>
                  <Text style={styles.date}>Generado el {formattedDate}</Text>
                </View>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>LOGO</Text>
                </View>
              </View>
            </View>

            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>
                ¡ATENCIÓN! Los siguientes productos requieren reposición inmediata. Se recomienda realizar pedidos a proveedores lo antes
                posible.
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.statValue}>{totalLowStock}</Text>
                <Text style={styles.statLabel}>Productos con bajo stock</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.statValue}>{criticalStock}</Text>
                <Text style={styles.statLabel}>En estado crítico</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.statValue}>{percentageOfTotal}%</Text>
                <Text style={styles.statLabel}>Del inventario total</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productos que Requieren Reposición</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColId]}>Código</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColDescription]}>Producto</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStock]}>Stock Actual</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStockMin]}>Stock Mínimo</Text>
                </View>
                {lowStockProducts.map((producto, index) => {
                  const priority = getRestockPriority(producto);
                  return (
                    <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                      <Text style={[styles.tableCol, styles.tableColId]}>{producto.id}</Text>
                      <Text style={[styles.tableCol, styles.tableColDescription]}>
                        {producto.description ?? ''}{' '}
                        {priority === 'crítica' ? ' - ¡URGENTE!' : priority === 'alta' ? ' - Prioridad Alta' : ''}
                      </Text>
                      <Text style={[styles.tableCol, styles.tableColStock, styles.stockLow]}>{producto.stock ?? 0}</Text>
                      <Text style={[styles.tableCol, styles.tableColStockMin]}>{producto.stock_min ?? 0}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Prioridad de Reposición</Text>
              <View style={styles.priorityIndicatorRow}>
                <View style={[styles.priorityIndicator, styles.priorityHigh]} />
                <Text style={styles.priorityText}>Prioridad Alta/Crítica: Productos con menos del 50% del stock mínimo requerido</Text>
              </View>
              <View style={styles.priorityIndicatorRow}>
                <View style={[styles.priorityIndicator, styles.priorityMedium]} />
                <Text style={styles.priorityText}>Prioridad Media: Productos entre el 50% y el 100% del stock mínimo requerido</Text>
              </View>
              <Text style={styles.actionNeeded}>Acciones Recomendadas:</Text>
              <Text style={styles.priorityText}>• Contactar a los proveedores inmediatamente para los productos marcados como URGENTE</Text>
              <Text style={styles.priorityText}>• Programar pedidos para todos los productos listados en este reporte</Text>
              <Text style={styles.priorityText}>• Revisar los tiempos de entrega de los proveedores para planificar adecuadamente</Text>
            </View>

            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages} | ${dataCompany?.name || 'Empresa'} | Sistema de Inventario | ${formattedDate}`
              }
              fixed
            />
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}

export default LowStockReport;
