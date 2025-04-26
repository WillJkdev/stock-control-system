import { Field } from '@/components/atoms/Field';
import { ListGene } from '@/components/atoms/ListGene';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/store/CompanyStore';
import { useProductStore } from '@/store/ProductStore';
import { Kardex, Users } from '@/types/types';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddKardexModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitKardex: (data: Partial<Kardex>) => void;
  mode: 'add' | 'edit';
  kardexToEdit?: Partial<Kardex> | undefined;
}

export interface KardexFormValues {
  date: string;
  movement_type: 'input' | 'output';
  quantity: number;
  details: string;
  user_id: string;
  product_id: string;
  company_id: string;
}

export function AddKardexModal({ open, onOpenChange, onSubmitKardex, mode, kardexToEdit }: AddKardexModalProps) {
  const { showProductsView, dataProducts } = useProductStore();
  const { dataCompany } = useCompanyStore();
  const queryClient = useQueryClient();
  const dataUsers = queryClient.getQueryData<Users>(['mostrar usuarios']);

  useEffect(() => {
    if (dataCompany?.id) {
      queryClient.prefetchQuery({
        queryKey: ['products_view', { _company_id: dataCompany.id }],
        queryFn: () => showProductsView({ _company_id: Number(dataCompany.id) }),
      });
    }
  }, [dataCompany?.id, queryClient, showProductsView]);

  const defaultValues = useMemo<Partial<Kardex>>(
    () => ({
      date: new Date().toISOString(),
      movement_type: 'input',
      quantity: 0,
      details: '',
      user_id: dataUsers?.id || 0,
      product_id: 0,
      company_id: dataCompany?.id || 0,
    }),
    [dataUsers?.id, dataCompany?.id],
  );

  const [date, setDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Partial<Kardex>>({
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'edit' && kardexToEdit) {
      reset(kardexToEdit);
      setDate(new Date(kardexToEdit.date || new Date()));
    } else {
      reset(defaultValues);
      setDate(new Date());
    }
  }, [mode, kardexToEdit, reset, defaultValues]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Partial<Kardex>) => {
    setIsSubmitting(true);
    try {
      await onSubmitKardex(data);
      reset(defaultValues);
      setDate(new Date());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange(isOpen)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Agregar Movimiento' : 'Editar Movimiento'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Completa los campos para registrar el movimiento.' : 'Actualiza la información del movimiento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <Field label="Fecha" htmlFor="date" error={errors.date?.message}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate || new Date());
                    setValue('date', (newDate || new Date()).toISOString());
                  }}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" {...register('date', { required: 'La fecha es requerida' })} value={date.toISOString()} />
          </Field>

          <Field label="Tipo de Movimiento" htmlFor="movement_type" error={errors.movement_type?.message}>
            <select
              id="movement_type"
              className="bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm"
              {...register('movement_type', { required: 'El tipo de movimiento es requerido' })}
            >
              <option value="input">Entrada</option>
              <option value="output">Salida</option>
            </select>
          </Field>

          <Field label="Producto" htmlFor="product_id" error={errors.product_id?.message}>
            <div className="flex gap-2">
              <div className="flex-1">
                <ListGene
                  data={dataProducts.map((product) => ({
                    id: product.id || 0,
                    description: (
                      <>
                        {product.description}{' '}
                        <span
                          className={cn('font-medium', (product.stock || 0) > (product.stock_min || 0) ? 'text-green-600' : 'text-red-600')}
                        >
                          (Stock: {product.stock})
                        </span>
                      </>
                    ),
                    searchValue: product.description || '', // 👈 Aquí agregas el campo para buscar
                  }))}
                  value={watch('product_id') || 0}
                  onValueChange={(value) =>
                    setValue('product_id', value, {
                      shouldValidate: true,
                    })
                  }
                  placeholder={dataProducts.length ? 'Seleccionar producto...' : 'No hay productos disponibles'}
                  searchPlaceholder="Buscar producto..."
                  emptyMessage="No se encontraron productos."
                />
              </div>
            </div>
          </Field>

          <Field label="Cantidad" htmlFor="quantity" error={errors.quantity?.message}>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              placeholder="0"
              {...register('quantity', {
                required: 'La cantidad es requerida',
                min: { value: 0.01, message: 'Debe ser mayor a 0' },
                setValueAs: (value) => (value === '' ? 0 : parseFloat(value)),
              })}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.value = '';
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  e.target.value = '0';
                }
              }}
            />
          </Field>

          <Field label="Detalles" htmlFor="details" error={errors.details?.message}>
            <Input
              id="details"
              placeholder="Descripción del movimiento"
              {...register('details', { required: 'Los detalles son requeridos' })}
            />
          </Field>

          <Field label="Usuario" htmlFor="user_id" error={errors.user_id?.message}>
            <Input id="user_name" value={dataUsers?.name || ''} readOnly className="bg-muted" />
          </Field>

          <Field label="Compañía" htmlFor="company_id" error={errors.company_id?.message}>
            <Input id="company_name" value={dataCompany?.name || ''} readOnly className="bg-muted" />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : mode === 'add' ? 'Guardar' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
