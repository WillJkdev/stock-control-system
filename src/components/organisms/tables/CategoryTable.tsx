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
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ActionConfirmation } from '@/components/molecules/ActionConfirmation';
import { AddCategoryModal } from '@/components/organisms/tables/AddCategory';
import { ColorPickerModal } from '@/components/organisms/tables/ColorPickerModal';
import { useCategoryStore } from '@/store/CategoryStore';
import { useCompanyStore } from '@/store/CompanyStore';
import { Categories } from '@/types/types';
import { capitalize } from '@/utils/capitalize';
import { validateHexColor } from '@/utils/color';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<Categories>();

// Datos de ejemplo
const exampleData: Categories[] = [];

export function CategoryTable({ data }: { data: Categories[] }) {
  const { dataCompany } = useCompanyStore();
  const { insertCategory, editCategory, deleteCategory, searcher, setSearcher } = useCategoryStore();

  const [sorting, setSorting] = useState<SortingState>([{ id: 'id', desc: false }]);
  const [searchFilter, setSearchFilter] = useState('');

  const tableData = useMemo(() => {
    if (!data || data.length === 0) return exampleData;
    return [...data].sort((a, b) => a.id - b.id); // Ordenamiento estable inicial
  }, [data]);

  const [editingDescription, setEditingDescription] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [editingColor, setEditingColor] = useState<string>('');

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isConfirmationOpenColor, setIsConfirmationOpenColor] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{ id: number; description: string } | null>(null);
  const [pendingEditColor, setPendingEditColor] = useState<{ id: number; color: string } | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [editingItem, setEditingItem] = useState<{
    id: number | null;
    field: 'description' | 'color' | null;
  }>({ id: null, field: null });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Categories | null>(null);

  const handleAddCategory = (newCategoryData: { f_company_id: number; f_color: string; f_description: string }) => {
    insertCategory({
      f_company_id: newCategoryData.f_company_id,
      f_color: newCategoryData.f_color,
      f_description: capitalize(newCategoryData.f_description),
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
          const category = row.original;
          return editingItem.id === category.id && editingItem.field === 'description' ? (
            <input
              autoFocus
              className={`w-full rounded-md border p-1 ${editingDescription.trim() === '' ? 'border-destructive' : 'border-input'}`}
              value={editingDescription}
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                setEditingDescription(input.value);
                setCursorPosition(input.selectionStart);
              }}
              onKeyUp={(e) => {
                const input = e.target as HTMLInputElement;
                setCursorPosition(input.selectionStart);
              }}
              ref={(input) => {
                if (input && cursorPosition !== null) {
                  input.setSelectionRange(cursorPosition, cursorPosition);
                }
              }}
              onBlur={() => {
                const capitalizedDescription = capitalize(editingDescription);
                const descriptionExists = tableData.some(
                  (cat) => cat.id !== category.id && cat.description.trim().toLowerCase() === capitalizedDescription.trim().toLowerCase(),
                );

                if (descriptionExists) {
                  toast.error('Ya existe una categoría con este nombre');
                  setEditingDescription(category.description);
                  setEditingItem({ id: null, field: null });
                  return;
                }

                if (capitalizedDescription.trim() !== category.description.trim() && capitalizedDescription.trim() !== '') {
                  setPendingEdit({
                    id: category.id,
                    description: capitalizedDescription,
                  });
                  setIsConfirmationOpen(true);
                } else {
                  setEditingDescription(category.description);
                  setEditingItem({ id: null, field: null });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const capitalizedDescription = capitalize(editingDescription);
                  const descriptionExists = tableData.some(
                    (cat) => cat.id !== category.id && cat.description.trim().toLowerCase() === capitalizedDescription.trim().toLowerCase(),
                  );

                  if (descriptionExists) {
                    toast.error('Ya existe una categoría con este nombre');
                    setEditingDescription(category.description);
                    setEditingItem({ id: null, field: null });
                    return;
                  }

                  if (capitalizedDescription !== category.description) {
                    setPendingEdit({
                      id: category.id,
                      description: capitalizedDescription,
                    });
                    setIsConfirmationOpen(true);
                  } else {
                    setEditingDescription(category.description);
                    setEditingItem({ id: null, field: null });
                  }
                } else if (e.key === 'Escape') {
                  setEditingDescription(category.description);
                  setEditingItem({ id: null, field: null });
                }
              }}
            />
          ) : (
            <span>{category.description}</span>
          );
        },
      }),
      columnHelper.accessor('color', {
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
                <span>Color</span>
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
          const category = row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 cursor-pointer rounded-full border"
                style={{ backgroundColor: category.color }}
                onClick={() => {
                  setSelectedCategory(category);
                  setEditingColor(category.color);
                  setShowColorPicker(true);
                }}
              />
              <span>{category.color}</span>
            </div>
          );
        },
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
          const category = row.original;
          const isGeneral = category.description.trim().toLowerCase() === 'general';

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
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.id.toString())}>
                    Copiar categoría ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingItem({ id: category.id, field: 'description' });
                      setEditingDescription(category.description);
                    }}
                  >
                    Editar descripción
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedCategory(category);
                      setEditingColor(category.color);
                      setShowColorPicker(true);
                    }}
                  >
                    Editar color
                  </DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => !isGeneral && setCategoryToDelete(category.id)}
                    className={`${isGeneral ? 'text-destructive cursor-not-allowed line-through' : 'text-destructive cursor-pointer'}`}
                    disabled={isGeneral}
                  >
                    Borrar categoría
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [editingDescription, editingItem, cursorPosition, tableData],
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
      <AddCategoryModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddCategory={handleAddCategory}
        dataCompany={dataCompany || undefined}
      />

      <ActionConfirmation
        open={isConfirmationOpen}
        setOpen={setIsConfirmationOpen}
        onConfirm={async () => {
          if (pendingEdit) {
            const descriptionExists = tableData.some(
              (cat) => cat.id !== pendingEdit.id && cat.description.trim().toLowerCase() === pendingEdit.description.trim().toLowerCase(),
            );

            if (descriptionExists) {
              toast.error('Ya existe una categoría con este nombre');
              const original = tableData.find((b) => b.id === pendingEdit.id);
              setEditingDescription(original?.description || '');
              setEditingItem({ id: null, field: null });
              setIsConfirmationOpen(false);
              return;
            }

            try {
              await editCategory({
                id: pendingEdit.id,
                data: { description: pendingEdit.description },
              });
              setEditingItem({ id: null, field: null });
            } catch (error) {
              console.error('Error al actualizar la categoría:', error);
              toast.error('Error al actualizar');
            }
          }
        }}
        onCancel={() => {
          const original = tableData.find((b) => b.id === pendingEdit?.id);
          setEditingDescription(original?.description || '');
          setEditingItem({ id: null, field: null });
        }}
        actionType="edit"
        itemName={`la categoría ${pendingEdit ? data.find((b) => b.id === pendingEdit.id)?.description : ''}`}
      />

      <ActionConfirmation
        open={isConfirmationOpenColor}
        setOpen={setIsConfirmationOpenColor}
        onConfirm={async () => {
          if (pendingEditColor && validateHexColor(pendingEditColor.color)) {
            try {
              await editCategory({
                id: pendingEditColor.id,
                data: { color: pendingEditColor.color },
              });
              setEditingItem({ id: null, field: null }); // <-- Actualizado
            } catch (error) {
              console.error('Error al actualizar el color:', error);
              toast.error('Error al actualizar el color');
            }
          }
        }}
        onCancel={() => {
          const original = tableData.find((b) => b.id === pendingEditColor?.id);
          setEditingColor(original?.color || '');
          setEditingItem({ id: null, field: null });
        }}
        actionType="edit"
        itemName={`el color de la categoría ${pendingEditColor ? data.find((b) => b.id === pendingEditColor.id)?.description : ''}`}
      />

      <ActionConfirmation
        open={categoryToDelete !== null}
        setOpen={(open) => !open && setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            const categoryToBeDeleted = tableData.find((b) => b.id === categoryToDelete);
            if (categoryToBeDeleted?.description.trim().toLowerCase() === 'general') {
              toast.error('No se puede eliminar la categoría General');
              return;
            }
            deleteCategory({ id: categoryToDelete });
            setCategoryToDelete(null);
          }
        }}
        actionType="delete"
        itemName={`la categoría ${categoryToDelete ? tableData.find((b) => b.id === categoryToDelete)?.description : ''}`}
      />

      <ColorPickerModal
        open={showColorPicker}
        onOpenChange={setShowColorPicker}
        currentColor={editingColor}
        categoryName={selectedCategory?.description || ''}
        onColorChange={(color) => {
          if (selectedCategory && color !== selectedCategory.color) {
            const upperColor = color.toUpperCase();
            setEditingColor(upperColor);
            setPendingEditColor({
              id: selectedCategory.id,
              color: upperColor,
            });
            setShowColorPicker(false);
            setIsConfirmationOpenColor(true);
          }
        }}
      />
    </div>
  );
}
