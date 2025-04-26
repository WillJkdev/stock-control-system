import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanyData } from '@/types/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddBrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBrand: (brand: { f_company_id: number; f_description: string }) => void;
  dataCompany?: CompanyData;
}

interface BrandFormValues {
  brandName: string;
  companyName: string;
}

export function AddBrandModal({ open, onOpenChange, onAddBrand, dataCompany }: AddBrandModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    defaultValues: {
      brandName: '',
      companyName: dataCompany?.name || '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: BrandFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddBrand({
        f_description: data.brandName.trim(),
        f_company_id: dataCompany?.id || 0,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Marca</DialogTitle>
          <DialogDescription>Completa los datos para crear una nueva marca. Haz clic en "Guardar" al terminar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandName" className="text-right">
                Nombre de Marca
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="brandName"
                  placeholder="Ingresar marca"
                  {...register('brandName', {
                    required: 'El nombre de la marca es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                    pattern: {
                      value: /^[a-zA-Z0-9\s]+$/,
                      message: 'Solo letras, números y espacios',
                    },
                  })}
                />
                {errors.brandName && <p className="text-destructive text-sm">{errors.brandName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Empresa
              </Label>
              <Input id="companyName" readOnly className="bg-muted col-span-3 cursor-default" {...register('companyName')} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
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
