// PDFReport.tsx
import { CompanyData, KardexView } from '@/types/types';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export function PDFReport({
  data,
  formattedDate,
  dataCompany,
}: {
  data: Partial<KardexView>[];
  formattedDate: string;
  dataCompany: CompanyData;
}) {
  // Calcular to
  // tales
  const totalMovements = data?.length ?? 0;
  const entriesCount = data?.filter((item) => item.movement_type === 'input' && item.status !== false).length ?? 0;
  const exitsCount = data?.filter((item) => item.movement_type === 'output' && item.status !== false).length ?? 0;
  const canceledCount = data?.filter((item) => item.status === false).length ?? 0;
  const getMovementTypeDisplay = (type: string | undefined, status: boolean | undefined) => {
    if (!type) return { text: '', style: styles.movementTypeCell };

    // Si el movimiento está anulado
    if (status === false) {
      return {
        text: 'Anulado',
        style: { ...styles.movementTypeCell, ...styles.canceledCell },
      };
    }

    const lowerType = type.toLowerCase();
    if (lowerType === 'input') {
      return {
        text: 'Entrada',
        style: { ...styles.movementTypeCell, ...styles.entryCell },
      };
    } else if (lowerType === 'output') {
      return {
        text: 'Salida',
        style: { ...styles.movementTypeCell, ...styles.exitCell },
      };
    }

    return { text: type, style: styles.movementTypeCell };
  };
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Reporte de Movimientos de Kardex</Text>
              <Text style={styles.subtitle}>{dataCompany?.name || 'Empresa'} - Registro de entradas y salidas</Text>
              <Text style={styles.dateTime}>Generado el {formattedDate}</Text>
            </View>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          </View>
        </View>

        {/* Resumen de movimientos */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, { backgroundColor: '#f0f9ff' }]}>
            <Text style={[styles.summaryValue, { color: '#0369a1' }]}>{totalMovements}</Text>
            <Text style={styles.summaryLabel}>Total Movimientos</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{entriesCount}</Text>
            <Text style={styles.summaryLabel}>Entradas</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>{exitsCount}</Text>
            <Text style={styles.summaryLabel}>Salidas</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.summaryValue, { color: '#d97706' }]}>{canceledCount}</Text>
            <Text style={styles.summaryLabel}>Anulados</Text>
          </View>
        </View>

        {/* Tabla de movimientos */}
        <View style={styles.section}>
          <View style={styles.tableContainer}>
            {/* Encabezado de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Fecha</Text>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Producto</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Cantidad</Text>
              <Text style={[styles.tableHeaderCell, styles.colMovementType]}>Tipo</Text>
              <Text style={[styles.tableHeaderCell, styles.colDetails]}>Detalles</Text>
              <Text style={[styles.tableHeaderCell, styles.colUserName]}>Usuario</Text>
              <Text style={[styles.tableHeaderCell, styles.colStock]}>Stock Final</Text>
            </View>

            {/* Filas de datos */}
            {data?.map((item, index) => (
              <View
                key={item.id}
                style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}, item.status === false ? styles.tableRowCanceled : {}]}
              >
                <Text style={[styles.tableCell, styles.colDate, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.date ? new Date(item.date).toLocaleDateString('es-ES') : ''}
                </Text>
                <Text style={[styles.tableCell, styles.colDescription, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.description ?? ''}
                </Text>
                <Text style={[styles.quantityCell, styles.colQuantity, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.quantity !== undefined ? String(item.quantity) : ''}
                </Text>
                <View style={[styles.colMovementType]}>
                  <View style={getMovementTypeDisplay(item.movement_type, item.status).style}>
                    <Text>{getMovementTypeDisplay(item.movement_type, item.status).text}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.colDetails, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.details ?? ''}
                </Text>
                <Text style={[styles.tableCell, styles.colUserName, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.user_name ?? ''}
                </Text>
                <Text style={[styles.stockCell, styles.colStock, item.status === false ? styles.tableCellCanceled : {}]}>
                  {item.stock !== undefined ? String(item.stock) : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Leyenda */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Leyenda</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#dcfce7' }]} />
            <Text style={styles.legendText}>Entrada: Incremento de stock por compras o devoluciones</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#fee2e2' }]} />
            <Text style={styles.legendText}>Salida: Reducción de stock por ventas o transferencias</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#fef3c7' }]} />
            <Text style={styles.legendText}>Anulado: Movimiento cancelado que no afecta el stock actual (tachado)</Text>
          </View>
        </View>

        {/* Pie de página */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} | ${dataCompany?.name || 'Empresa'} | Sistema de Inventario | ${formattedDate}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// Estilos mejorados
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
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
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 5,
    color: '#334155',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  dateTime: {
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: 5,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  summaryBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: '30%',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 30,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableRowCanceled: {
    backgroundColor: '#fef2f2', // Rojo muy claro
    opacity: 0.9,
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    textAlign: 'left',
  },
  tableCellCanceled: {
    color: '#ef4444', // Color del texto para celdas anuladas
    textDecoration: 'line-through',
  },
  colDate: { width: '12%' },
  colDescription: { width: '25%' },
  colQuantity: { width: '10%', textAlign: 'center' },
  colMovementType: { width: '10%', textAlign: 'center' },
  colDetails: { width: '23%' },
  colUserName: { width: '10%' },
  colStock: { width: '10%', textAlign: 'center' },
  entryText: {
    color: '#16a34a',
    fontWeight: 700,
  },
  exitText: {
    color: '#dc2626',
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#94a3b8',
  },
  quantityCell: {
    padding: 8,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 500,
  },
  stockCell: {
    padding: 8,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 700,
  },
  movementTypeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    fontSize: 9,
    borderRadius: 3,
    margin: 2,
    gap: 4,
  },
  entryCell: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  exitCell: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  canceledCell: {
    backgroundColor: '#fee2e2', // Rojo más visible para la celda de tipo
    color: '#dc2626',
  },
  movementIcon: {
    width: 12,
    height: 12,
  },
  adjustmentCell: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  legendContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: '#334155',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendBox: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 9,
    color: '#64748b',
  },
});
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
