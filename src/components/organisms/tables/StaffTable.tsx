import { AddUserModal } from '@/components/organisms/tables/AddUser';
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
import { useCompanyStore } from '@/store/CompanyStore';
import { useUserStore } from '@/store/UserStore';
import { Modules, Users } from '@/types/types';
import { TypeDocData, TypeUserData } from '@/utils/staticData';
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
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ActionConfirmation } from '@/components/molecules/ActionConfirmation';

const columnHelper = createColumnHelper<Users>();

// Datos de ejemplo
const exampleData: Users[] = [];

export function StaffTable({ data }: { data: Users[] }) {
  const { dataCompany } = useCompanyStore();
  const { insertUser, editUserId, deleteUser, dataModules, searcher, setSearcher } = useUserStore();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [searchFilter, setSearchFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  const handleAddUser = (
    email: string,
    password: string,
    newUserData: Partial<Users>,
    dataCheckPermissions: Pick<Modules, 'id' | 'check'>[],
  ) => {
    insertUser({
      email,
      password,
      userParams: newUserData,
      dataCheckPermissions,
    });
  };

  const handleEditUser = async (id: number, data: Partial<Users>) => {
    try {
      await editUserId({ id, data });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      toast.error('Error al actualizar el usuario');
    }
  };

  const tableData = useMemo(() => {
    if (!data || data.length === 0) return exampleData;
    return [...data].sort((a, b) => a.id - b.id); // Ordenamiento estable inicial
  }, [data]);

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
      columnHelper.accessor('name', {
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
                <span>Name</span>
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
      columnHelper.accessor('nro_doc', {
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
                <span>Numero de documento</span>
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
      columnHelper.accessor('phone', {
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
                <span>Numero de teléfono</span>
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
      columnHelper.accessor('address', {
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
                <span>Dirección</span>
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

      // columnHelper.accessor('user_id', {
      columnHelper.accessor('status', {
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
                <span>Status</span>
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
      columnHelper.accessor('role', {
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
                <span>Rol</span>
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
          const roleId = info.getValue();
          const roleData = TypeUserData.find((role) => role.id === roleId);
          return (
            <div className="flex items-center gap-2">
              <span>{roleData?.icon}</span>
              <span className="font-medium capitalize">{roleData?.description || roleId}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('type_doc', {
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
                <span>Tipo de documento</span>
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
          const typeId = info.getValue();
          const typeData = TypeDocData.find((type) => type.id === typeId);
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{typeData?.description || typeId}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('email', {
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
                <span>Email</span>
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
          const user = row.original;
          const isGeneral = user.name.trim().toLowerCase() === 'generic';

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
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText((user.id ?? '').toString())}>
                    Copiar categoría ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedUser(user);
                      setShowAddModal(true);
                    }}
                  >
                    Editar usuario
                  </DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => !isGeneral && user.auth_id != null && setUserToDelete(user.auth_id)}
                    className={`${isGeneral ? 'text-destructive cursor-not-allowed line-through' : 'text-destructive cursor-pointer'}`}
                    disabled={isGeneral}
                  >
                    Eliminar usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [],
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
          <div className="relative max-w-sm">
            <Input
              placeholder="Buscar Usuario..."
              value={searcher}
              onChange={(e) => {
                const value = e.target.value;
                setSearcher(value);
                setSearchFilter(value);
              }}
              className="pr-8"
            />
            {searcher && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => {
                  setSearcher('');
                  setSearchFilter('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
      <AddUserModal
        open={showAddModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedUser(null);
          }
          setShowAddModal(isOpen);
        }}
        onAddUser={!selectedUser ? handleAddUser : undefined}
        onEditUser={selectedUser ? handleEditUser : undefined}
        dataCompany={dataCompany || undefined}
        mode={selectedUser ? 'edit' : 'add'}
        userToEdit={selectedUser || undefined}
        dataModules={dataModules || undefined}
      />
      <ActionConfirmation
        open={userToDelete !== null}
        setOpen={(open) => !open && setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser({ uuid_user_id: userToDelete });
            setUserToDelete(null);
          }
        }}
        actionType="delete"
        itemName={`el usuario ${userToDelete ? tableData.find((b) => b.auth_id === userToDelete)?.name : ''}`}
      />
    </div>
  );
}
