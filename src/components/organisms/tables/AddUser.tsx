import { Field } from '@/components/atoms/Field';
import { MultiSelectCheckbox } from '@/components/atoms/MultiSelectCheckbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCompanyStore } from '@/store/CompanyStore';
import { useUserStore } from '@/store/UserStore';
import { CompanyData, Modules, Users } from '@/types/types';
import { TypeDocData, TypeUserData } from '@/utils/staticData';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser?: (email: string, password: string, userParams: Partial<Users>, dataCheckPermissions: Pick<Modules, 'id' | 'check'>[]) => void;
  onEditUser?: (id: number, data: Partial<Users>) => void;
  userToEdit?: Users;
  dataCompany?: CompanyData;
  dataModules?: Modules[];
  mode: 'add' | 'edit';
}

interface UserFormValues {
  email: string;
  password: string;
  name: string;
  nro_doc: string;
  phone: string;
  address: string;
  reg_date: string;
  status: string;
  role: string;
  auth_id: string;
  type_doc: string;
  company_id: number;
  modules?: { id: number; check: boolean }[];
}
const getModifiedFields = <T extends Record<string, unknown>>(original: Partial<T>, current: Partial<T>) => {
  const modified: Partial<T> = {};

  for (const key in current) {
    const typedKey = key as keyof T;
    const originalValue = original[typedKey];
    const currentValue = current[typedKey];

    if (currentValue !== originalValue && currentValue !== undefined && currentValue !== '') {
      modified[typedKey] = currentValue;
    }
  }

  return modified;
};

export function AddUserModal({ open, onOpenChange, onAddUser, onEditUser, userToEdit, dataCompany, dataModules, mode }: AddUserModalProps) {
  const emptyValues = useMemo<UserFormValues>(
    () => ({
      email: '',
      password: '',
      name: '',
      nro_doc: '',
      phone: '',
      address: '',
      reg_date: '',
      status: '',
      role: '',
      auth_id: '',
      type_doc: '',
      company_id: dataCompany?.id || 0,
      modules: [],
    }),
    [dataCompany?.id],
  );

  const editValues = useMemo<UserFormValues>(
    () => ({
      email: userToEdit?.email || '',
      password: '',
      name: userToEdit?.name || '',
      nro_doc: userToEdit?.nro_doc || '',
      phone: userToEdit?.phone || '',
      address: userToEdit?.address || '',
      reg_date: userToEdit?.reg_date || '',
      status: userToEdit?.status || '',
      role: userToEdit?.role || '',
      auth_id: userToEdit?.auth_id || '',
      type_doc: userToEdit?.type_doc || '',
      company_id: userToEdit?.company_id || dataCompany?.id || 0,
      // modules: [],
    }),
    [userToEdit, dataCompany?.id],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>();

  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const { showPermissionsEdit } = useUserStore(); // Obtén la función del store

  const { data: userPermissions } = useQuery({
    queryKey: ['userPermissionsEdit', userToEdit?.id],
    queryFn: () => (userToEdit?.id ? showPermissionsEdit({ id: userToEdit.id }) : null),
    enabled: mode === 'edit' && !!userToEdit?.id,
  });

  useEffect(() => {
    if (mode === 'edit' && userToEdit && userPermissions) {
      reset(editValues);
      setSelectedModules(userPermissions.map((perm) => perm?.module_id).filter(Boolean) as number[]);
    } else {
      reset(emptyValues);
      setSelectedModules([]);
    }
  }, [mode, userToEdit, editValues, emptyValues, reset, userPermissions, dataModules]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { dataCompanies } = useCompanyStore();

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Users> = {
        ...data,
        company_id: dataCompany?.id || 0,
      };

      if (mode === 'add' && onAddUser) {
        await onAddUser(
          data.email,
          data.password,
          payload,
          selectedModules.map((id) => ({ id, check: true })),
        );
      } else if (mode === 'edit' && onEditUser && userToEdit?.id) {
        // const originalData = editValues as Partial<Users>;
        const originalData = editValues as Partial<Users>;
        const modifiedFields = getModifiedFields(originalData, payload);

        // Si estás editando email o password, asegúrate de incluir auth_id
        const isSensitiveChange = data.email !== originalData.email || data.password !== '';

        if (isSensitiveChange && userToEdit?.auth_id) {
          modifiedFields.auth_id = userToEdit.auth_id;
        }

        // Solo si hay cambios en los módulos
        const originalModules = (userPermissions ?? []).map((perm) => perm.module_id).sort();
        const currentModules = [...selectedModules].sort();

        const areModulesEqual =
          originalModules.length === currentModules.length && originalModules.every((val, index) => val === currentModules[index]);

        if (!areModulesEqual) {
          // agregamos al payload un campo extra o lo pasas aparte
          modifiedFields.modules = selectedModules.map((id) => ({ id, check: true }));
        }

        await onEditUser(userToEdit.id, modifiedFields);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Agregar' : 'Editar'} Usuario</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Completa los datos para crear un nuevo usuario.' : 'Modifica los datos del usuario.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                type="email"
                id="email"
                placeholder="usuario@correo.com"
                // disabled={mode === 'edit'}
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Correo inválido',
                  },
                })}
              />
            </Field>
            <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
              <Input
                type="password"
                id="password"
                placeholder="Ingrese contraseña"
                {...register('password', {
                  required: mode === 'add' ? 'La contraseña es requerida' : false,
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
            </Field>

            <Field label="Nombre completo" htmlFor="name" error={errors.name?.message}>
              <Input id="name" placeholder="Nombre del usuario" {...register('name', { required: 'Nombre requerido' })} />
            </Field>

            <Field label="Nro. Documento" htmlFor="nro_doc" error={errors.nro_doc?.message}>
              <Input id="nro_doc" placeholder="Número de documento" {...register('nro_doc')} />
            </Field>

            <Field label="Tipo Documento" htmlFor="type_doc" error={errors.type_doc?.message}>
              <select
                id="type_doc"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                {...register('type_doc', {
                  required: 'El tipo de documento es requerido',
                })}
              >
                <option value="">Seleccione tipo de documento</option>
                {TypeDocData.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.icon} {doc.description}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Teléfono" htmlFor="phone">
              <Input id="phone" placeholder="Número de celular" {...register('phone')} />
            </Field>

            <Field label="Dirección" htmlFor="address">
              <Input id="address" placeholder="Dirección del usuario" {...register('address')} />
            </Field>

            <Field label="Tipo de usuario" htmlFor="role" error={errors.role?.message}>
              <select
                id="role"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                {...register('role', {
                  required: 'El tipo de rol es requerido',
                })}
              >
                <option value="">Seleccione tipo de rol</option>
                {TypeUserData.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.icon}
                    {doc.description}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Estado" htmlFor="status">
              <Input id="status" placeholder="activo / inactivo" {...register('status')} />
            </Field>

            <Field label="Empresa" htmlFor="company_id">
              <Input
                type="text"
                readOnly
                className="bg-muted cursor-default"
                value={dataCompanies?.find((company) => company.id === watch('company_id'))?.name || 'N/A'}
              />
              <input type="hidden" {...register('company_id')} />
            </Field>

            <Field label="Permisos" htmlFor="modules">
              <MultiSelectCheckbox
                modules={dataModules ?? []} // Array de módulos disponibles
                selectedModules={selectedModules}
                onModulesChange={(moduleIds) => {
                  setSelectedModules(moduleIds);
                  const modulePermissions = moduleIds.map((id) => ({
                    id,
                    check: true,
                  }));
                  setValue('modules', modulePermissions);
                }}
                placeholder="Seleccionar módulos"
                searchPlaceholder="Buscar módulos..."
              />
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
    </Dialog>
  );
}
