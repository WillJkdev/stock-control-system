'use client';

import { ListGene } from '@/components/atoms/ListGene';
import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import type { Products } from '@/types/types';
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
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
    color: '#047857', // Verde esmeralda para el título
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#047857',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 5,
    textAlign: 'center',
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
    color: '#047857',
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
    minHeight: 40, // Filas más altas para mejor visualización
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: '#047857',
    fontWeight: 700,
  },
  tableCol: {
    padding: 10,
    fontSize: 12, // Texto más grande para mejor legibilidad
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
  infoCard: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    width: '30%',
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
  },
  infoValue: {
    width: '70%',
    fontSize: 12,
    color: '#111827',
  },
  stockStatus: {
    marginTop: 25,
    padding: 15,
    borderRadius: 8,
  },
  stockStatusNormal: {
    backgroundColor: '#ecfdf5', // Verde claro
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  stockStatusWarning: {
    backgroundColor: '#fffbeb', // Amarillo claro
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  stockStatusLow: {
    backgroundColor: '#fee2e2', // Rojo claro
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  stockStatusTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  stockStatusTitleNormal: {
    color: '#047857',
  },
  stockStatusTitleWarning: {
    color: '#b45309',
  },
  stockStatusTitleLow: {
    color: '#b91c1c',
  },
  stockStatusText: {
    fontSize: 12,
    lineHeight: 1.5,
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
});

// Función para determinar el estado del stock de un producto
function getStockStatus(product: Partial<Products>) {
  if (product.stock && product.stock_min) {
    if (product.stock < product.stock_min) {
      return 'low';
    } else if (product.stock < product.stock_min * 1.2) {
      return 'warning';
    }
  }
  return 'normal';
}

// Componente para el reporte de stock actual
function CurrentStockProduct() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { reportProducts } = useProductStore();
  const { dataCompany } = useCompanyStore();

  const { data, isLoading, error } = useQuery<Partial<Products>[]>({
    queryKey: ['report-products', { company_id: dataCompany?.id }],
    queryFn: () => reportProducts({ company_id: Number(dataCompany?.id) }),
  });

  if (isLoading) return <SpinnerLoader />;
  if (error) return <ErrorComponent message={error.message} />;

  // Obtener el producto seleccionado
  const selectedProduct = data?.find((product) => product.id === selectedProductId);

  // Determinar el estado del stock
  const stockStatus = selectedProduct ? getStockStatus(selectedProduct) : 'normal';

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
        <h2 className="mb-4 text-xl font-bold text-gray-800">Reporte de Stock por Producto</h2>
        <p className="mb-6 text-gray-600">Selecciona un producto para generar un reporte detallado de su estado de inventario actual.</p>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-60">
            <div className="bg-background">
              {/* Eliminamos el ícono de búsqueda superpuesto y dejamos que ListGene maneje su propio estilo */}
              <ListGene
                className="max-w-60"
                data={
                  data?.map((product) => ({
                    id: product.id ?? 0,
                    description: (
                      <div className="flex items-center">
                        <span>{product.description ?? ''}</span>
                        {product.stock && product.stock_min && (
                          <div className="ml-auto flex items-center">
                            <div
                              className={`ml-2 h-2 w-2 rounded-full ${
                                product.stock < product.stock_min
                                  ? 'bg-red-500'
                                  : product.stock < product.stock_min * 1.2
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ),
                    searchValue: product.description,
                  })) ?? []
                }
                value={selectedProductId ?? 0}
                onValueChange={(id) => setSelectedProductId(id)}
                placeholder="Selecciona un producto..."
                searchPlaceholder="Buscar productos..."
              />
            </div>
          </div>

          {selectedProductId && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 sm:mt-0">
              <div
                className={`h-3 w-3 rounded-full ${
                  stockStatus === 'low' ? 'bg-red-500' : stockStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  stockStatus === 'low' ? 'text-red-700' : stockStatus === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {stockStatus === 'low' ? 'Stock Crítico' : stockStatus === 'warning' ? 'Stock Bajo' : 'Stock Normal'}
              </span>
            </div>
          )}
        </div>
      </div>

      {selectedProductId && selectedProduct && (
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
                    <Text style={styles.title}>Reporte de Stock de Producto</Text>
                    <Text style={styles.subtitle}>{dataCompany?.name || 'Empresa'} - Detalle de inventario individual</Text>
                    <Text style={styles.date}>Generado el {formattedDate}</Text>
                  </View>
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>LOGO</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.productTitle}>{selectedProduct.description}</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Código:</Text>
                  <Text style={styles.infoValue}>{selectedProduct.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Descripción:</Text>
                  <Text style={styles.infoValue}>{selectedProduct.description}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Stock Actual:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      stockStatus === 'low' ? styles.stockLow : stockStatus === 'warning' ? styles.stockWarning : styles.stockNormal,
                    ]}
                  >
                    {selectedProduct.stock ?? 0} unidades
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Stock Mínimo:</Text>
                  <Text style={styles.infoValue}>{selectedProduct.stock_min ?? 0} unidades</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      stockStatus === 'low' ? styles.stockLow : stockStatus === 'warning' ? styles.stockWarning : styles.stockNormal,
                    ]}
                  >
                    {stockStatus === 'low' ? 'Stock Crítico' : stockStatus === 'warning' ? 'Stock Bajo' : 'Stock Normal'}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalle de Stock</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableRowHeader]}>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColId]}>Código</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColDescription]}>Producto</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStock]}>Stock Actual</Text>
                    <Text style={[styles.tableCol, styles.tableColHeader, styles.tableColStockMin]}>Stock Mínimo</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, styles.tableColId]}>{selectedProduct.id}</Text>
                    <Text style={[styles.tableCol, styles.tableColDescription]}>{selectedProduct.description ?? ''}</Text>
                    <Text
                      style={[
                        styles.tableCol,
                        styles.tableColStock,
                        stockStatus === 'low' ? styles.stockLow : stockStatus === 'warning' ? styles.stockWarning : styles.stockNormal,
                      ]}
                    >
                      {selectedProduct.stock ?? 0}
                    </Text>
                    <Text style={[styles.tableCol, styles.tableColStockMin]}>{selectedProduct.stock_min ?? 0}</Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.stockStatus,
                  stockStatus === 'low'
                    ? styles.stockStatusLow
                    : stockStatus === 'warning'
                      ? styles.stockStatusWarning
                      : styles.stockStatusNormal,
                ]}
              >
                <Text
                  style={[
                    styles.stockStatusTitle,
                    stockStatus === 'low'
                      ? styles.stockStatusTitleLow
                      : stockStatus === 'warning'
                        ? styles.stockStatusTitleWarning
                        : styles.stockStatusTitleNormal,
                  ]}
                >
                  {stockStatus === 'low'
                    ? 'Alerta: Stock Crítico'
                    : stockStatus === 'warning'
                      ? 'Advertencia: Stock Bajo'
                      : 'Estado: Stock Normal'}
                </Text>
                <Text style={styles.stockStatusText}>
                  {stockStatus === 'low'
                    ? `El producto "${selectedProduct.description}" tiene un stock actual (${
                        selectedProduct.stock ?? 0
                      }) por debajo del mínimo requerido (${
                        selectedProduct.stock_min ?? 0
                      }). Se recomienda realizar un pedido de reposición urgente.`
                    : stockStatus === 'warning'
                      ? `El producto "${selectedProduct.description}" tiene un stock actual (${
                          selectedProduct.stock ?? 0
                        }) cercano al mínimo requerido (${
                          selectedProduct.stock_min ?? 0
                        }). Se recomienda monitorear y planificar una reposición próximamente.`
                      : `El producto "${selectedProduct.description}" tiene un stock actual (${
                          selectedProduct.stock ?? 0
                        }) adecuado, por encima del mínimo requerido (${
                          selectedProduct.stock_min ?? 0
                        }). No se requieren acciones inmediatas.`}
                </Text>
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

export default CurrentStockProduct;
