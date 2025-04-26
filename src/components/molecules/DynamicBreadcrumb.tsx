import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link, useLocation } from 'react-router';

export function DynamicBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  const breadcrumbLabels: Record<string, string> = {
    '': 'Inicio',
    settings: 'Configuración',
    brands: 'Marcas',
    categories: 'Categorías',
    products: 'Productos',
    staff: 'Personal',
    kardex: 'Kardex',
    reports: 'Reportes',
    'low-stock-report': 'Stock Bajo',
    'movements-report': 'Movimientos',
    'current-stock-product': 'Stock por Producto',
    'total-current-stock': 'Stock Total',
    'valued-inventory-report': 'Inventario Valuado',
  };

  const formatBreadcrumb = (segment: string) => {
    return breadcrumbLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((segment, index) => {
          const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;

          return (
            <div key={routeTo} className="flex items-center gap-1">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{formatBreadcrumb(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo}>{formatBreadcrumb(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
