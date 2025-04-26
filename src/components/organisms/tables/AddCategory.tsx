import { useState } from 'react';
import { CirclePicker } from 'react-color';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { CompanyData } from '@/types/types';
import { capitalize } from '@/utils/capitalize';

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: { f_company_id: number; f_color: string; f_description: string }) => void;
  dataCompany?: CompanyData;
}

interface CategoryFormValues {
  categoryName: string;
  categoryColor: string;
  companyName: string;
}

export function AddCategoryModal({ open, onOpenChange, onAddCategory, dataCompany }: AddCategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      categoryName: '',
      categoryColor: '#FF5722',
      companyName: dataCompany?.name || '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentColor = watch('categoryColor');

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddCategory({
        f_description: capitalize(data.categoryName.trim()),
        f_color: data.categoryColor,
        f_company_id: dataCompany?.id || 0,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      categoryName: '',
      categoryColor: '#FF5722',
      companyName: dataCompany?.name || '',
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Categoría</DialogTitle>
          <DialogDescription>Completa los datos para crear una nueva categoría. Haz clic en "Guardar" al terminar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Nombre de la categoría */}
            <Field label="Nombre" htmlFor="categoryName" error={errors.categoryName?.message}>
              <Input
                id="categoryName"
                placeholder="Ingresar categoría"
                {...register('categoryName', {
                  required: 'El nombre de la categoría es requerido',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                  pattern: {
                    value: /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/,
                    message: 'Solo letras, números y espacios',
                  },
                })}
              />
            </Field>

            {/* Picker de color */}
            <Field label="Color" htmlFor="categoryColor">
              <div className="flex flex-col items-center gap-4">
                <CirclePicker color={currentColor} onChange={(color) => setValue('categoryColor', color.hex.toUpperCase())} width="100%" />
                <div className="flex w-full items-center gap-2">
                  <div className="h-8 w-8 rounded border" style={{ backgroundColor: currentColor }} />
                  <span className="text-muted-foreground text-sm">{currentColor}</span>
                </div>
              </div>
            </Field>

            {/* Empresa */}
            <Field label="Empresa" htmlFor="companyName">
              <Input id="companyName" readOnly className="bg-muted cursor-default" {...register('companyName')} />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, htmlFor, children, error }: { label: string; htmlFor: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={htmlFor} className="text-right">
        {label}
      </Label>
      <div className="col-span-3 space-y-1">
        {children}
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
}
