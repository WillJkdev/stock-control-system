import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useBrandStore } from '@/store/BrandStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';

import { ActionConfirmation } from '@/components/molecules/ActionConfirmation';
import { AddProductModal } from '@/components/organisms/tables/AddProduct';
import { useCategoryStore } from '@/store/CategoryStore';
import { functionProduct, Products, ProductsView } from '@/types/types';
import { capitalize } from '@/utils/capitalize';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<ProductsView>();

const formatCurrency = (amount: number, symbol: string = 'S/.') => {
  return `${symbol} ${amount.toFixed(2)}`;
};

// Datos de ejemplo
const exampleData: ProductsView[] = [];

export function ProductTable({ data }: { data: ProductsView[] }) {
  const { dataCompany } = useCompanyStore();
  const { dataBrands } = useBrandStore();
  const { dataCategories } = useCategoryStore();

  const { insertProduct, deleteProduct, searcher, setSearcher, editProduct } = useProductStore();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);

  const tableData = useMemo(() => {
    if (!data || data.length === 0) return exampleData;
    return [...data].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); // Ordenamiento estable inicial
  }, [data]);

  const handleAddProduct = (newProductData: functionProduct) => {
    insertProduct({
      ...newProductData,
      _description: capitalize(newProductData._description),
    });
  };

  const handleEditProduct = async (id: number, data: Partial<Products>) => {
    try {
      await editProduct({ id, data });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  // Definición de columnas
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          const ariaSortValue = isSorted === 'asc' ? 'ascending' : isSorted === 'desc' ? 'descending' : 'none';
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting(column.getIsSorted() === 'asc') : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
              aria-sort={ariaSortValue}
              title={canSort ? 'Click para ordenar' : ''}
            >
              <div className="flex items-center">
                <span>ID</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Description</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('stock', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Stock</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('sale_price', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Precio Venta</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{formatCurrency(info.getValue(), dataCompany?.currency_symbol)}</span>,
      }),
      columnHelper.accessor('purchase_price', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Precio Compra</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => <span className="font-medium">{formatCurrency(info.getValue(), dataCompany?.currency_symbol)}</span>,
      }),
      // columnHelper.accessor('category_id', {
      columnHelper.accessor('categories', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Categoría</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        // cell: (info) => {
        //   const categoryId = info.getValue();
        //   const category = dataCategories?.find((cat) => cat.id === categoryId);
        //   return <span className="font-medium">{category?.description || 'N/A'}</span>;
        // },
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color || '#6b7280' }} />
              <span className="font-medium">{row.categories}</span>
            </div>
          );
        },
      }),
      // columnHelper.accessor('brand_id', {
      columnHelper.accessor('brand', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Marca</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        // cell: (info) => {
        //   const brandId = info.getValue();
        //   const brand = dataBrands?.find((b) => b.id === brandId);
        //   return <span className="font-medium">{brand?.description || 'N/A'}</span>;
        // },
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('created_at', {
        header: ({ column }) => {
          const canSort = column.getCanSort();
          const isSorted = column.getIsSorted();

          return (
            <Button
              variant="ghost"
              onClick={canSort ? () => column.toggleSorting() : undefined}
              className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
            >
              <div className="flex items-center">
                <span>Created At</span>
                {canSort && (
                  <span className="ml-2 transition-all duration-200">
                    {isSorted === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : isSorted === 'desc' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                    )}
                  </span>
                )}
              </div>
            </Button>
          );
        },
        cell: (info) => {
          const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            // hour: '2-digit',
            // minute: '2-digit',
            // timeZone: 'UTC' // Opcional para zonas horarias
          };

          try {
            const value = info.getValue();
            const date = value ? new Date(value) : new Date();
            return isNaN(date.getTime()) ? 'Fecha inválida' : new Intl.DateTimeFormat('es-ES', options).format(date);
          } catch {
            return 'Error en fecha';
          }
        },
        sortingFn: (rowA, rowB, columnId) => {
          // Ordenamiento para fechas
          const dateA = new Date(rowA.getValue(columnId));
          const dateB = new Date(rowB.getValue(columnId));

          return dateA.getTime() - dateB.getTime();
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const product = row.original;
          const isGeneral = product.description.trim().toLowerCase() === 'general';

          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText((product.id ?? '').toString())}>
                    Copiar categoría ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowAddModal(true);
                    }}
                  >
                    Editar producto
                  </DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => !isGeneral && product.id != null && setProductToDelete(product.id)}
                    className={`${isGeneral ? 'text-destructive cursor-not-allowed line-through' : 'text-destructive cursor-pointer'}`}
                    disabled={isGeneral}
                  >
                    Eliminar producto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [dataCompany],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter: searchFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
      sorting: [{ id: 'id', desc: false }],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Empresa: {dataCompany?.name}</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar Producto..." value={searcher} onChange={(e) => setSearcher(e.target.value)} className="max-w-sm" />
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación mejorada */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          Mostrando{' '}
          {table.getFilteredRowModel().rows.length === 0
            ? 0
            : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          {' a '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{' '}
          de {table.getFilteredRowModel().rows.length} registros
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => (
              <Button
                key={i}
                variant={i === table.getState().pagination.pageIndex ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </Button>
            ))}
            {table.getPageCount() > 5 && <span className="px-2">...</span>}
          </div>

          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8">
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modales */}
      <ActionConfirmation
        open={productToDelete !== null}
        setOpen={(open) => !open && setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            const categoryToBeDeleted = tableData.find((b) => b.id === productToDelete);
            if (categoryToBeDeleted?.description.trim().toLowerCase() === 'general') {
              toast.error('No se puede eliminar la categoría General');
              return;
            }
            deleteProduct({ id: productToDelete });
            setProductToDelete(null);
          }
        }}
        actionType="delete"
        itemName={`el producto ${productToDelete ? tableData.find((b) => b.id === productToDelete)?.description : ''}`}
      />
      <AddProductModal
        open={showAddModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedProduct(null);
          }
          setShowAddModal(isOpen);
        }}
        onAddProduct={!selectedProduct ? handleAddProduct : undefined}
        onEditProduct={selectedProduct ? handleEditProduct : undefined}
        dataCompany={dataCompany || undefined}
        brands={dataBrands}
        categories={dataCategories}
        mode={selectedProduct ? 'edit' : 'add'}
        productToEdit={selectedProduct || undefined}
      />
    </div>
  );
}
