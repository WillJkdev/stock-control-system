import { CardInfo } from '@/components/atoms/CardInfo';
import { ErrorComponent } from '@/components/molecules/ErrorComponent';
import { PDFReport } from '@/components/molecules/PDFMovementReport';
import { SmallGridLoader } from '@/components/molecules/SmallGridLoader';
import { SpinnerLoader } from '@/components/molecules/SpinnerLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useCompanyStore } from '@/store/CompanyStore';
import { useKardexStore } from '@/store/KardexStore';
import { CompanyData, KardexView } from '@/types/types';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownCircle, ArrowUpCircle, Ban, Download, FileText, Printer, Search } from 'lucide-react';
import { memo, useState } from 'react';

// Define props interface for MemoizedPDFViewer
interface PDFViewerProps {
  data: Partial<KardexView>[] | undefined;
  dataCompany: CompanyData | null;
  formattedDate: string;
}

const MemoizedPDFViewer = memo(({ data, dataCompany, formattedDate }: PDFViewerProps) => (
  <PDFViewer
    className="rounded-lg shadow-lg"
    style={{
      width: '100%',
      height: '80vh',
      border: 'none',
    }}
  >
    <PDFReport data={data ?? []} dataCompany={dataCompany!} formattedDate={formattedDate} />
  </PDFViewer>
));

MemoizedPDFViewer.displayName = 'MemoizedPDFViewer';

function MovementsReport() {
  const { searchKardex } = useKardexStore();
  const { dataCompany } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['buscar kardex-reporte', { company_id: dataCompany?.id, description: debouncedSearchTerm }],
    queryFn: () => searchKardex({ company_id: Number(dataCompany?.id), description: debouncedSearchTerm }),
    enabled: !!dataCompany?.id,
  });

  // Calcular totales
  const totalMovements = data?.length ?? 0;
  const entriesCount = data?.filter((item) => item.movement_type === 'input' && item.status !== false).length ?? 0;
  const exitsCount = data?.filter((item) => item.movement_type === 'output' && item.status !== false).length ?? 0;
  const canceledCount = data?.filter((item) => item.status === false).length ?? 0;

  if (error) return <ErrorComponent message={error.message} />;

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

  const handleDownload = async () => {
    try {
      const blob = await pdf(<PDFReport data={data ?? []} dataCompany={dataCompany!} formattedDate={formattedDate} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-kardex-${formattedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="container mx-auto p-4 md:p-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-b from-white to-slate-50 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <CardTitle className="text-2xl font-bold text-slate-800">Reporte de Movimientos de Kardex</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 border border-slate-300 bg-slate-100 text-slate-700 shadow-sm transition-colors hover:bg-slate-200"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 border border-slate-300 bg-slate-100 text-slate-700 shadow-sm transition-colors hover:bg-slate-200"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Tarjetas de Totales */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Movements */}
              <CardInfo
                icon={<FileText className="h-5 w-5 text-slate-700" />}
                value={isFetching ? <SmallGridLoader size="xs" /> : totalMovements.toLocaleString()}
                label="Total"
                color="slate"
              />

              {/* Entries */}
              <CardInfo
                icon={<ArrowUpCircle className="h-5 w-5 text-green-700" />}
                value={isFetching ? <SmallGridLoader size="xs" /> : entriesCount.toLocaleString()}
                label="Entradas"
                color="green"
              />

              {/* Exits */}
              <CardInfo
                icon={<ArrowDownCircle className="h-5 w-5 text-red-700" />}
                value={isFetching ? <SmallGridLoader size="xs" /> : exitsCount.toLocaleString()}
                label="Salidas"
                color="red"
              />

              {/* Canceled */}
              <CardInfo
                icon={<Ban className="h-5 w-5 text-amber-700" />}
                value={isFetching ? <SmallGridLoader size="xs" /> : canceledCount.toLocaleString()}
                label="Anulados"
                color="amber"
              />
            </div>
          </CardContent>

          {/* Barra de búsqueda */}
          <div className="mb-6 flex flex-col gap-4 pl-6 sm:flex-row">
            <div className="relative max-w-xl flex-grow">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-900" />
              <Input
                placeholder="Buscar por producto, detalles o usuario..."
                className="pl-9 text-slate-900 placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* PDF Viewer con Spinner */}
      {isLoading ? (
        <div className="bg-background flex h-[80vh] w-full items-center justify-center rounded-lg border border-slate-200 shadow-md">
          <SpinnerLoader />
        </div>
      ) : (
        <MemoizedPDFViewer data={data} dataCompany={dataCompany} formattedDate={formattedDate} />
      )}
    </div>
  );
}

export default MovementsReport;
