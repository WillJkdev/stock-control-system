'use client';

import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Calculator,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  Package,
  Printer,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';

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

// Estilos mejorados para el PDF
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
    color: '#4f46e5', // Indigo para el título
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
    color: '#4f46e5',
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
    backgroundColor: '#4f46e5',
    fontWeight: 700,
  },
  tableRowEven: {
    backgroundColor: '#f5f3ff',
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
    width: '10%',
  },
  tableColDescription: {
    width: '40%',
  },
  tableColStock: {
    width: '15%',
    textAlign: 'center',
  },
  tableColPrice: {
    width: '15%',
    textAlign: 'right',
  },
  tableColTotal: {
    width: '20%',
    textAlign: 'right',
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
    backgroundColor: '#f5f3ff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#4f46e5',
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
    backgroundColor: '#f5f3ff',
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
  totalRow: {
    backgroundColor: '#4f46e5',
    borderBottomWidth: 0,
  },
  totalText: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 12,
  },
  currencyText: {
    fontFamily: 'Roboto',
    fontWeight: 400,
  },
  valueSummaryContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f3ff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  valueSummaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#4f46e5',
  },
  valueSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  valueSummaryLabel: {
    fontSize: 12,
    color: '#4b5563',
    width: '60%',
  },
  valueSummaryValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#111827',
    width: '40%',
    textAlign: 'right',
  },
  valueSummaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#4f46e5',
  },
  valueSummaryTotalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#4f46e5',
    width: '60%',
  },
  valueSummaryTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#4f46e5',
    width: '40%',
    textAlign: 'right',
  },
});

function ValuedInventoryReport() {
  const { reportValuedInventory } = useProductStore();
  const { dataCompany } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('value'); // value, stock, name
  const [activeTab, setActiveTab] = useState('report');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['buscar report-valued-inventory', { company_id: dataCompany?.id, product: debouncedSearchTerm }],
    queryFn: () => reportValuedInventory({ company_id: Number(dataCompany?.id), product: debouncedSearchTerm }),
    enabled: !!dataCompany?.id,
  });

  if (error) return <ErrorComponent message={error.message} />;

  // Ordenar datos según el criterio seleccionado
  const sortedData = data
    ? [...data].sort((a, b) => {
        if (sortBy === 'value') {
          return (b.total ?? 0) - (a.total ?? 0);
        } else if (sortBy === 'stock') {
          return (b.stock ?? 0) - (a.stock ?? 0);
        } else {
          return (a.description ?? '').localeCompare(b.description ?? '');
        }
      })
    : [];

  // Calcular el total general
  const totalGeneral = sortedData?.reduce((sum, producto) => sum + (producto.total ?? 0), 0) || 0;

  // Calcular totales
  const totalProducts = sortedData?.length || 0;
  const lowStockProducts = sortedData?.filter((p) => p.stock && p.stock_min && p.stock < p.stock_min).length || 0;
  const warningStockProducts =
    sortedData?.filter((p) => p.stock && p.stock_min && p.stock >= p.stock_min && p.stock < p.stock_min * 1.2).length || 0;
  const normalStockProducts = sortedData?.filter((p) => p.stock && p.stock_min && p.stock >= p.stock_min * 1.2).length || 0;

  // Calcular estadísticas de valor
  const highValueProducts = sortedData?.filter((p) => (p.total ?? 0) > 1000).length || 0;
  const mediumValueProducts = sortedData?.filter((p) => (p.total ?? 0) <= 1000 && (p.total ?? 0) > 100).length || 0;
  const lowValueProducts = sortedData?.filter((p) => (p.total ?? 0) <= 100).length || 0;

  // Formatear fecha actual
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} ${currentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`;

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `${dataCompany?.currency_symbol ?? 'S/.'} ${value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <CardTitle className="text-2xl font-bold text-indigo-800 dark:text-white">Reporte de Inventario Valorizado</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="report" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reporte
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="space-y-4">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-grow">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Buscar por código o descripción..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        <SelectValue placeholder="Ordenar por" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value">Mayor valor</SelectItem>
                      <SelectItem value="stock">Mayor stock</SelectItem>
                      <SelectItem value="name">Alfabético</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Package className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">{totalProducts}</div>
                    <div className="text-xs text-gray-500">Total productos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <CreditCard className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">{formatCurrency(totalGeneral).split(' ')[0]}</div>
                    <div className="text-xs text-gray-500">Valor total</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Calculator className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(totalGeneral / (totalProducts || 1)).split(' ')[1]}
                    </div>
                    <div className="text-xs text-gray-500">Valor promedio</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <ChevronDown className="h-5 w-5 text-indigo-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">{lowStockProducts}</div>
                    <div className="text-xs text-gray-500">Stock crítico</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-indigo-800">Distribución por Valor</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Alto valor (&gt;1000)</span>
                      <span className="text-xs font-medium">{highValueProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{
                          width: `${(highValueProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Valor medio (100-1000)</span>
                      <span className="text-xs font-medium">{mediumValueProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-indigo-400"
                        style={{
                          width: `${(mediumValueProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Bajo valor (&lt;100)</span>
                      <span className="text-xs font-medium">{lowValueProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-indigo-200"
                        style={{
                          width: `${(lowValueProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-indigo-800">Distribución por Stock</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Stock normal</span>
                      <span className="text-xs font-medium">{normalStockProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${(normalStockProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Stock bajo</span>
                      <span className="text-xs font-medium">{warningStockProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{
                          width: `${(warningStockProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Stock crítico</span>
                      <span className="text-xs font-medium">{lowStockProducts}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{
                          width: `${(lowStockProducts / (totalProducts || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold text-indigo-800">Resumen de Valor de Inventario</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Valor total del inventario</span>
                    <span className="text-sm font-medium">{formatCurrency(totalGeneral)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Valor promedio por producto</span>
                    <span className="text-sm font-medium">{formatCurrency(totalGeneral / (totalProducts || 1))}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 py-2">
                    <span className="text-sm text-gray-600">Productos de alto valor (&gt;1000)</span>
                    <span className="text-sm font-medium">{highValueProducts}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Productos con stock crítico</span>
                    <span className="text-sm font-medium text-red-600">{lowStockProducts}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* PDF Viewer con Spinner */}
      {isLoading ? (
        <div className="bg-background flex h-[80vh] w-full items-center justify-center rounded-lg border border-slate-200 shadow-md">
          <SpinnerLoader />
        </div>
      ) : (
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
                    <Text style={styles.title}>Reporte de Inventario Valorizado</Text>
                    <Text style={styles.subtitle}>{dataCompany?.name || 'Empresa'} - Valoración monetaria del inventario</Text>
                    <Text style={styles.date}>Generado el {formattedDate}</Text>
                  </View>
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>LOGO</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={[styles.statBox, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[styles.statValue, { color: '#4f46e5' }]}>{totalProducts}</Text>
                  <Text style={styles.statLabel}>Total Productos</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[styles.statValue, { color: '#4f46e5' }]}>
                    <Text style={styles.currencyText}>{dataCompany?.currency_symbol ?? 'S/.'}</Text>{' '}
                    {totalGeneral.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Valor Total</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[styles.statValue, { color: '#4f46e5' }]}>
                    <Text style={styles.currencyText}>{dataCompany?.currency_symbol ?? 'S/.'}</Text>{' '}
                    {(totalGeneral / (totalProducts || 1)).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Valor Promedio</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Listado de Productos Valorizados</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableRowHeader]}>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColId]}>Código</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColDescription]}>Producto</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStock]}>Stock</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColPrice]}>
                      Precio Compra ({dataCompany?.currency_symbol ?? 'S/.'})
                    </Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColTotal]}>
                      Total ({dataCompany?.currency_symbol ?? 'S/.'})
                    </Text>
                  </View>
                  {sortedData?.map((producto, index: number) => {
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
                        <Text style={[styles.tableCol, styles.tableColPrice]}>
                          {(producto.purchase_price ?? 0).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                        <Text style={[styles.tableCol, styles.tableColTotal]}>
                          {(producto.total ?? 0).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[styles.tableCol, styles.tableColId, styles.totalText]}></Text>
                    <Text style={[styles.tableCol, styles.tableColDescription, styles.totalText]}>TOTAL GENERAL</Text>
                    <Text style={[styles.tableCol, styles.tableColStock, styles.totalText]}></Text>
                    <Text style={[styles.tableCol, styles.tableColPrice, styles.totalText]}></Text>
                    <Text style={[styles.tableCol, styles.tableColTotal, styles.totalText]}>
                      {totalGeneral.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.valueSummaryContainer}>
                <Text style={styles.valueSummaryTitle}>Resumen de Valorización</Text>
                <View style={styles.valueSummaryRow}>
                  <Text style={styles.valueSummaryLabel}>Valor total del inventario:</Text>
                  <Text style={styles.valueSummaryValue}>
                    {dataCompany?.currency_symbol ?? 'S/.'}{' '}
                    {totalGeneral.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View style={styles.valueSummaryRow}>
                  <Text style={styles.valueSummaryLabel}>Valor promedio por producto:</Text>
                  <Text style={styles.valueSummaryValue}>
                    {dataCompany?.currency_symbol ?? 'S/.'}{' '}
                    {(totalGeneral / (totalProducts || 1)).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View style={styles.valueSummaryRow}>
                  <Text style={styles.valueSummaryLabel}>Productos de alto valor (&gt;1000):</Text>
                  <Text style={styles.valueSummaryValue}>{highValueProducts}</Text>
                </View>
                <View style={styles.valueSummaryTotal}>
                  <Text style={styles.valueSummaryTotalLabel}>Fecha de valorización:</Text>
                  <Text style={styles.valueSummaryTotalValue}>{formattedDate}</Text>
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
      )}
    </div>
  );
}

export default ValuedInventoryReport;
