import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

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

import { ActionConfirmation } from '@/components/molecules/ActionConfirmation';
import { AddBrandModal } from '@/components/organisms/tables/AddBrand';
import { useBrandStore } from '@/store/BrandStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { Brands } from '@/types/types';
import { capitalize } from '@/utils/capitalize';

const columnHelper = createColumnHelper<Brands>();

// Datos de ejemplo
const exampleData: Brands[] = [];

export function BrandTable({ data }: { data: Brands[] }) {
  const { dataCompany } = useCompanyStore();
  const { editBrand, deleteBrand } = useBrandStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const tableData = useMemo(() => {
    if (!data || data.length === 0) return exampleData;
    return [...data].sort((a, b) => a.id - b.id); // Ordenamiento estable inicial
  }, [data]);

  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{ id: number; description: string } | null>(null);

  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const { insertBrand } = useBrandStore(); // Asegúrate de tener esta acción en tu store
  const handleAddBrand = (newBrandData: { f_company_id: number; f_description: string }) => {
    insertBrand({
      f_company_id: newBrandData.f_company_id,
      f_description: capitalize(newBrandData.f_description),
    });
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
        cell: ({ row }) => {
          const brand = row.original;

          return editingBrandId === brand.id ? (
            <input
              autoFocus
              className={`w-full rounded-md border p-1 ${editingDescription.trim() === '' ? 'border-destructive' : 'border-input'}`}
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              onBlur={() => {
                const capitalizedDescription = capitalize(editingDescription);
                if (capitalizedDescription.trim() !== brand.description.trim() && capitalizedDescription.trim() !== '') {
                  setPendingEdit({
                    id: brand.id,
                    description: capitalizedDescription,
                  });
                  setIsConfirmationOpen(true);
                } else {
                  setEditingBrandId(null);
                  setEditingDescription(brand.description);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const capitalizedDescription = capitalize(editingDescription);
                  if (capitalizedDescription !== brand.description) {
                    setPendingEdit({
                      id: brand.id,
                      description: capitalizedDescription,
                    });
                    setIsConfirmationOpen(true);
                  } else {
                    setEditingBrandId(null);
                  }
                } else if (e.key === 'Escape') {
                  setEditingDescription(brand.description);
                  setEditingBrandId(null);
                }
              }}
            />
          ) : (
            <span>{brand.description}</span>
          );
        },
      }),
      // columnHelper.accessor('company_id', {
      //   header: ({ column }) => (
      //     <Button
      //       variant="ghost"
      //       onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      //       className="p-0 font-bold hover:bg-transparent"
      //     >
      //       Company ID
      //       {column.getIsSorted() === 'asc' ? (
      //         <ArrowUp className="ml-2 h-4 w-4" />
      //       ) : column.getIsSorted() === 'desc' ? (
      //         <ArrowDown className="ml-2 h-4 w-4" />
      //       ) : null}
      //     </Button>
      //   ),
      //   cell: (info) => info.getValue(),
      // }),
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
            // timeZone: 'UTC' // Opcional si manejas zonas horarias
          };

          try {
            const date = new Date(info.getValue());
            return isNaN(date.getTime()) ? 'Fecha inválida' : new Intl.DateTimeFormat('es-ES', options).format(date);
          } catch {
            return 'Error en fecha';
          }
        },
        sortingFn: (rowA, rowB, columnId) => {
          // Ordenamiento seguro para fechas
          const dateA = new Date(rowA.getValue(columnId));
          const dateB = new Date(rowB.getValue(columnId));

          return dateA.getTime() - dateB.getTime();
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const brand = row.original;

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
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(brand.id.toString())}>Copy brand ID</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingBrandId(brand.id);
                      setEditingDescription(brand.description);
                    }}
                  >
                    Edit brand
                  </DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setBrandToDelete(brand.id)} className="text-destructive">
                    Delete brand
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [editingBrandId, editingDescription],
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
    },
  });

  const { searcher, setSearcher } = useBrandStore();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Empresa: {dataCompany?.name}</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar Marca..."
            // value={searchFilter}
            value={searcher}
            // onChange={(e) => setSearchFilter(e.target.value)}
            onChange={(e) => setSearcher(e.target.value)}
            className="max-w-sm"
          />
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
                  No results found.
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
      <AddBrandModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddBrand={handleAddBrand}
        dataCompany={dataCompany || undefined}
      />

      <ActionConfirmation
        open={isConfirmationOpen}
        setOpen={setIsConfirmationOpen}
        onConfirm={() => {
          if (pendingEdit) {
            editBrand({ id: pendingEdit.id, data: { description: pendingEdit.description } });
            setEditingBrandId(null);
          }
        }}
        onCancel={() => {
          const originalBrand = tableData.find((b) => b.id === pendingEdit?.id);
          setEditingDescription(originalBrand?.description || '');
        }}
        actionType="edit"
        itemName={`la marca ${pendingEdit ? data.find((b) => b.id === pendingEdit.id)?.description : ''}`}
      />

      <ActionConfirmation
        open={brandToDelete !== null}
        setOpen={(open) => !open && setBrandToDelete(null)}
        onConfirm={() => {
          if (brandToDelete) {
            deleteBrand({ id: brandToDelete });
            setBrandToDelete(null);
          }
        }}
        actionType="delete"
        itemName={`la marca ${brandToDelete ? tableData.find((b) => b.id === brandToDelete)?.description : ''}`}
      />
    </div>
  );
}
