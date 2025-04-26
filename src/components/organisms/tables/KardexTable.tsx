import { ActionConfirmation } from '@/components/molecules/ActionConfirmation';
import { AddKardexModal } from '@/components/organisms/tables/AddKardex';
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
import { useKardexStore } from '@/store/KardexStore';
import { Kardex, KardexView } from '@/types/types';
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
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<Partial<KardexView>>();

interface MovementTableProps {
  movements: Partial<KardexView>[];
}

export function MovementTable({ movements }: MovementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [searchFilter, setSearchFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKardex, setSelectedKardex] = useState<Kardex | null>(null);
  const [kardexToDelete, setKardexToDelete] = useState<number | null>(null);

  const { insertKardex, editKardex, deleteKardex, setSearcher, searcher } = useKardexStore();
  const handleAddKardex = (newKardexData: Partial<Kardex>) => {
    insertKardex({
      ...newKardexData,
    });
  };

  const handleEditKardex = async (id: number, data: Partial<Kardex>) => {
    try {
      await editKardex({ id, data });
      setSelectedKardex(null);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      header: ({ column }) => {
        const canSort = column.getCanSort();
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={canSort ? () => column.toggleSorting(column.getIsSorted() === 'asc') : undefined}
            className={`group p-0 font-bold ${canSort ? 'cursor-pointer hover:bg-transparent' : 'cursor-default'}`}
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
    columnHelper.accessor('date', {
      header: ({ column }) => {
        const canSort = column.getCanSort();
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={canSort ? () => column.toggleSorting(isSorted === 'asc') : undefined}
            className="group cursor-pointer p-0 font-bold hover:bg-transparent"
          >
            <div className="flex items-center">
              <span>Fecha</span>
              <span className="ml-2 transition-all duration-200">
                {isSorted === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : isSorted === 'desc' ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-70" />
                )}
              </span>
            </div>
          </Button>
        );
      },
      cell: (info) => {
        const dateValue = info.getValue();
        if (!dateValue) return '-';

        try {
          const date = new Date(dateValue);
          return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          return dateValue;
        }
      },
      enableSorting: true, // Habilitar ordenamiento
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId);
        const b = rowB.getValue(columnId);
        const dateA = typeof a === 'string' ? new Date(a).getTime() : 0;
        const dateB = typeof b === 'string' ? new Date(b).getTime() : 0;
        return dateA - dateB;
      },
    }),
    columnHelper.accessor('description', {
      header: 'Producto',
      cell: (info) => {
        const status = info.row.original.status;
        return <span className={status === false ? 'text-destructive' : ''}>{info.getValue() || '-'}</span>;
      },
    }),
    columnHelper.accessor('movement_type', {
      header: 'Tipo',
      cell: (info) => {
        const type = info.getValue();
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              type === 'input' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {type === 'input' ? (
              <>
                <ArrowUpRight className="mr-1 h-3 w-3" /> Entrada
              </>
            ) : (
              <>
                <ArrowDownRight className="mr-1 h-3 w-3" /> Salida
              </>
            )}
          </span>
        );
      },
    }),
    columnHelper.accessor('quantity', {
      header: 'Cantidad',
      cell: (info) => info.getValue() || '0',
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: (info) => `${info.getValue() || '0'}`,
    }),
    columnHelper.accessor('details', {
      header: 'Detalles',
      cell: (info) => {
        const status = info.row.original.status;
        return <span className={status === false ? 'text-destructive' : ''}>{info.getValue() || '-'}</span>;
      },
    }),
    columnHelper.accessor('user_name', {
      header: 'Usuario',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const movement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(movement.id?.toString() || '')}>
                Copiar ID de movimiento
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/movimientos/${movement.id}`}>Ver detalle</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => movement.status !== false && movement.id != null && setKardexToDelete(movement.id)}
                className={
                  movement.status === false ? 'text-destructive cursor-not-allowed line-through' : 'text-destructive cursor-pointer'
                }
                disabled={movement.status === false}
              >
                Eliminar movimiento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: movements,
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
        pageSize: 10,
      },
      sorting: [{ id: 'date', desc: true }],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Historial de Movimientos</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar Categoría..." value={searcher} onChange={(e) => setSearcher(e.target.value)} className="max-w-sm" />
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
                  No se encontraron movimientos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        open={kardexToDelete !== null}
        setOpen={(open) => !open && setKardexToDelete(null)}
        onConfirm={() => {
          if (kardexToDelete) {
            deleteKardex({ id: kardexToDelete });
            setKardexToDelete(null);
          }
        }}
        actionType="delete"
        itemName={`el movimiento ${kardexToDelete ? movements.find((b) => b.id === kardexToDelete)?.description : ''}`}
      />
      <AddKardexModal
        open={showAddModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedKardex(null);
          }
          setShowAddModal(isOpen);
        }}
        onSubmitKardex={!selectedKardex ? handleAddKardex : (data) => handleEditKardex(selectedKardex.id!, data)}
        kardexToEdit={selectedKardex || undefined}
        mode={selectedKardex ? 'edit' : 'add'}
      />
    </div>
  );
}
