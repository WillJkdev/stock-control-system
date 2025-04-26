import { Field } from '@/components/atoms/Field';
import { ListGene } from '@/components/atoms/ListGene';
import { AddBrandModal } from '@/components/organisms/tables/AddBrand';
import { AddCategoryModal } from '@/components/organisms/tables/AddCategory';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useBrandStore } from '@/store/BrandStore';
import { useCategoryStore } from '@/store/CategoryStore';
import { Brands, Categories, CompanyData, functionProduct, Products } from '@/types/types';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct?: (product: functionProduct) => void;
  onEditProduct?: (id: number, data: Partial<Products>) => void;
  dataCompany?: CompanyData;
  categories?: Categories[];
  brands?: Brands[];
  mode: 'add' | 'edit';
  productToEdit?: Products;
}

interface ProductFormValues {
  description: string;
  brand_id: number;
  stock: number;
  stock_min: number;
  barcode: number;
  internal_code: string;
  purchase_price: number;
  sale_price: number;
  category_id: number;
  companyName: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function AddProductModal({
  open,
  onOpenChange,
  onAddProduct,
  onEditProduct,
  dataCompany,
  categories = [],
  brands = [],
  mode,
  productToEdit,
}: AddProductModalProps) {
  const emptyValues = useMemo<ProductFormValues>(
    () => ({
      description: '',
      brand_id: 0,
      stock: 0,
      stock_min: 0,
      barcode: 0,
      internal_code: '',
      purchase_price: 0,
      sale_price: 0,
      category_id: 0,
      companyName: dataCompany?.name || '',
    }),
    [dataCompany?.name],
  );

  const editValues = useMemo<ProductFormValues>(
    () => ({
      description: productToEdit?.description || '',
      brand_id: productToEdit?.brand_id || 0,
      stock: productToEdit?.stock || 0,
      stock_min: productToEdit?.stock_min || 0,
      barcode: productToEdit?.barcode || 0,
      internal_code: productToEdit?.internal_code || '',
      purchase_price: productToEdit?.purchase_price || 0,
      sale_price: productToEdit?.sale_price || 0,
      category_id: productToEdit?.category_id || 0,
      companyName: dataCompany?.name || '',
    }),
    [productToEdit, dataCompany?.name],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>();

  useEffect(() => {
    if (mode === 'edit' && productToEdit) {
      reset(editValues);
    } else {
      reset(emptyValues);
    }
  }, [mode, productToEdit, editValues, emptyValues, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);

  const { insertBrand } = useBrandStore();
  const handleAddBrand = async (brand: { f_company_id: number; f_description: string }) => {
    insertBrand({
      f_company_id: brand.f_company_id,
      f_description: capitalize(brand.f_description),
    });
  };

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const { insertCategory } = useCategoryStore();
  const handleAddCategory = (category: { f_company_id: number; f_color: string; f_description: string }) => {
    insertCategory({
      f_company_id: category.f_company_id,
      f_color: category.f_color,
      f_description: capitalize(category.f_description),
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        description: capitalize(data.description.trim()),
        brand_id: data.brand_id,
        stock: parseFloat(data.stock.toString()),
        stock_min: parseFloat(data.stock_min.toString()),
        barcode: parseFloat(data.barcode.toString()),
        internal_code: data.internal_code,
        purchase_price: parseFloat(data.purchase_price.toString()),
        sale_price: parseFloat(data.sale_price.toString()),
        category_id: data.category_id,
      };

      if (mode === 'add' && onAddProduct) {
        await onAddProduct({
          _description: capitalize(payload.description.trim()),
          _brand_id: payload.brand_id,
          _stock: payload.stock,
          _stock_min: payload.stock_min,
          _barcode: payload.barcode,
          _internal_code: payload.internal_code,
          _purchase_price: payload.purchase_price,
          _sale_price: payload.sale_price,
          _category_id: payload.category_id,
          _company_id: dataCompany?.id || 0,
        });
      } else if (mode === 'edit' && onEditProduct && productToEdit?.id) {
        await onEditProduct(productToEdit.id, payload);
      }

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
        if (!isOpen && mode === 'add') reset(emptyValues);
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Agregar' : 'Editar'} Producto</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Completa los datos para crear un nuevo producto.' : 'Modifica los datos del producto.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Descripción */}
            <Field label="Descripción" htmlFor="description" error={errors.description?.message}>
              <Input
                id="description"
                placeholder="Ingrese descripción"
                {...register('description', {
                  required: 'La descripción es requerida',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                })}
              />
            </Field>

            {/* Marca con botón de añadir */}
            <Field label="Marca" htmlFor="brand_id" error={errors.brand_id?.message}>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ListGene
                    data={brands}
                    value={watch('brand_id')}
                    onValueChange={(value) => setValue('brand_id', value, { shouldValidate: true })}
                    placeholder={brands.length ? 'Seleccionar marca...' : 'No hay marcas disponibles'}
                    searchPlaceholder="Buscar marca..."
                    emptyMessage="No se encontraron marcas."
                  />
                </div>
                <Button type="button" size="icon" onClick={() => setIsAddBrandOpen(true)} className="h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            {/* Stock */}
            <Field label="Stock" htmlFor="stock" error={errors.stock?.message}>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                id="stock"
                {...register('stock', {
                  required: 'El stock es requerido',
                  min: { value: 0, message: 'El stock no puede ser negativo' },
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

            {/* Stock mínimo */}
            <Field label="Stock Mínimo" htmlFor="stock_min" error={errors.stock_min?.message}>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                id="stock_min"
                {...register('stock_min', {
                  required: 'El stock mínimo es requerido',
                  min: { value: 0, message: 'El stock mínimo no puede ser negativo' },
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

            {/* Código de barras */}
            <Field label="Código de Barras" htmlFor="barcode" error={errors.barcode?.message}>
              <Input
                id="barcode"
                type="number"
                placeholder="0"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                {...register('barcode', {
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

            {/* Código interno */}
            <Field label="Código Interno" htmlFor="internal_code" error={errors.internal_code?.message}>
              <Input id="internal_code" {...register('internal_code')} />
            </Field>

            {/* Precio compra */}
            <Field label="Precio Compra" htmlFor="purchase_price" error={errors.purchase_price?.message}>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                id="purchase_price"
                {...register('purchase_price', {
                  required: 'El precio de compra es requerido',
                  min: { value: 0, message: 'El precio no puede ser negativo' },
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

            {/* Precio venta */}
            <Field label="Precio Venta" htmlFor="sale_price" error={errors.sale_price?.message}>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                id="sale_price"
                {...register('sale_price', {
                  required: 'El precio de venta es requerido',
                  min: { value: 0, message: 'El precio no puede ser negativo' },
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

            {/* Categoría con botón de añadir */}
            <Field label="Categoría" htmlFor="category_id" error={errors.category_id?.message}>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ListGene
                    data={categories}
                    value={watch('category_id')}
                    onValueChange={(value) => setValue('category_id', value, { shouldValidate: true })}
                    placeholder={categories.length ? 'Seleccionar categoría...' : 'No hay categorías disponibles'}
                    searchPlaceholder="Buscar producto..."
                    emptyMessage="No se encontraron categorías."
                  />
                </div>
                <Button type="button" size="icon" onClick={() => setIsAddCategoryOpen(true)} className="h-10 w-10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            {/* Empresa */}
            <Field label="Empresa" htmlFor="companyName">
              <Input id="companyName" readOnly className="bg-muted cursor-default" {...register('companyName')} />
            </Field>
          </div>

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

      <AddBrandModal open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen} onAddBrand={handleAddBrand} dataCompany={dataCompany} />
      <AddCategoryModal
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onAddCategory={handleAddCategory}
        dataCompany={dataCompany}
      />
    </Dialog>
  );
}
