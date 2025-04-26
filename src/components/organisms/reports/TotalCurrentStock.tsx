import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import type { Products } from '@/types/types';
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';

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

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
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
    color: '#0369a1', // Azul para el título
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    color: '#0369a1',
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
    backgroundColor: '#0369a1',
    fontWeight: 700,
  },
  tableRowEven: {
    backgroundColor: '#f0f9ff',
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
    backgroundColor: '#f0f9ff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#0369a1',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#0369a1',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginBottom: 3,
  },
  stockNormal: {
    color: '#047857',
    fontWeight: 700,
  },
  stockLow: {
    color: '#dc2626',
    fontWeight: 700,
  },
  stockWarning: {
    color: '#f59e0b',
    fontWeight: 700,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f9ff',
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#4b5563',
  },
});

function TotalCurrentStock() {
  const { reportProducts } = useProductStore();
  const { dataCompany } = useCompanyStore();

  const { data, isLoading, error } = useQuery<Partial<Products>[]>({
    queryKey: ['report-products', { company_id: dataCompany?.id }],
    queryFn: () => reportProducts({ company_id: Number(dataCompany?.id) }),
  });

  if (isLoading) return <SpinnerLoader />;
  if (error) return <ErrorComponent message={error.message} />;

  const totalProducts = data?.length || 0;
  const lowStockProducts = data?.filter((p) => p.stock && p.stock_min && p.stock < p.stock_min).length || 0;
  const warningStockProducts =
    data?.filter((p) => p.stock && p.stock_min && p.stock >= p.stock_min && p.stock < p.stock_min * 1.2).length || 0;
  const normalStockProducts = data?.filter((p) => p.stock && p.stock_min && p.stock >= p.stock_min * 1.2).length || 0;

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
            <h2 className="mb-2 text-2xl font-bold text-blue-700">Reporte de Stock Actual</h2>
            <p className="text-gray-600">
              {totalProducts} productos en inventario • {formattedDate}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="text-2xl font-bold text-blue-700">{totalProducts}</div>
            <div className="text-sm text-gray-600">Total productos</div>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="text-2xl font-bold text-green-700">{normalStockProducts}</div>
            <div className="text-sm text-gray-600">Stock normal</div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="text-2xl font-bold text-amber-700">{warningStockProducts}</div>
            <div className="text-sm text-gray-600">Stock bajo</div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="text-2xl font-bold text-red-700">{lowStockProducts}</div>
            <div className="text-sm text-gray-600">Stock crítico</div>
          </div>
        </div>
      </div>

      <PDFViewer
        style={{
          width: '100%',
          height: '80vh',
          border: 'none',
          borderRadius: '8px',
        }}
        className="shadow-md"
      >
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Reporte de Stock Actual</Text>
                  <Text style={styles.subtitle}>{dataCompany?.name || 'Empresa'} - Inventario completo de productos</Text>
                  <Text style={styles.date}>Generado el {formattedDate}</Text>
                </View>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>LOGO</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.statValue, { color: '#0369a1' }]}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Total Productos</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.statValue, { color: '#047857' }]}>{normalStockProducts}</Text>
                <Text style={styles.statLabel}>Stock Normal</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{warningStockProducts}</Text>
                <Text style={styles.statLabel}>Stock Bajo</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fee2e2' }]}>
                <Text style={[styles.statValue, { color: '#dc2626' }]}>{lowStockProducts}</Text>
                <Text style={styles.statLabel}>Stock Crítico</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listado de Productos</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColId]}>Código</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColDescription]}>Producto</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStock]}>Stock Actual</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStockMin]}>Stock Mínimo</Text>
                </View>
                {data?.map((producto, index: number) => {
                  // Determinar el estilo del stock según su nivel
                  let stockStyle = styles.stockNormal;
                  if (producto.stock && producto.stock_min && producto.stock < producto.stock_min) {
                    stockStyle = styles.stockLow;
                  } else if (producto.stock && producto.stock_min && producto.stock < producto.stock_min * 1.2) {
                    stockStyle = styles.stockWarning;
                  }

                  return (
                    <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                      <Text style={[styles.tableCol, styles.tableColId]}>{producto.id}</Text>
                      <Text style={[styles.tableCol, styles.tableColDescription]}>{producto.description ?? ''}</Text>
                      <Text style={[styles.tableCol, styles.tableColStock, stockStyle]}>{producto.stock ?? 0}</Text>
                      <Text style={[styles.tableCol, styles.tableColStockMin]}>{producto.stock_min ?? 0}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Leyenda de Estado de Stock</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                <Text style={styles.legendText}>
                  Stock Crítico: Productos por debajo del stock mínimo que requieren reposición urgente.
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>Stock Bajo: Productos cerca del stock mínimo que deben ser monitoreados.</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#047857' }]} />
                <Text style={styles.legendText}>Stock Normal: Productos con niveles de stock adecuados.</Text>
              </View>
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

export default TotalCurrentStock;
