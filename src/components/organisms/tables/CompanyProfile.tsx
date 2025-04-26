import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCompanyStore } from '@/store/CompanyStore';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, DollarSign, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CompanyProfile() {
  const queryClient = useQueryClient();
  const { dataCompany, editCompany } = useCompanyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Solo mantenemos los dos campos originales
  const [formData, setFormData] = useState({
    name: dataCompany?.name || '',
    currency_symbol: dataCompany?.currency_symbol || '',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = async () => {
    if (!dataCompany?.id) return;

    setIsSaving(true);
    try {
      await editCompany({
        user_admin_id: dataCompany.id,
        data: {
          name: formData.name,
          currency_symbol: formData.currency_symbol,
        },
      });

      // Invalidar la caché y refrescar los datos
      await queryClient.invalidateQueries({ queryKey: ['mostrar empresa'] });

      toast.success('Cambios guardados', {
        description: 'La información de la empresa ha sido actualizada correctamente.',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      toast.error('Error al guardar', {
        description: 'No se pudieron guardar los cambios. Intente nuevamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: dataCompany?.name || '',
      currency_symbol: dataCompany?.currency_symbol || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="relative rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
        <div className="bg-grid-slate-200/25 dark:bg-grid-slate-700/25 absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-auto py-1 text-2xl font-bold md:text-3xl"
                  placeholder="Nombre de la empresa"
                />
              ) : (
                <h1 className="text-2xl font-bold md:text-3xl">{dataCompany?.name}</h1>
              )}
              <p className="text-muted-foreground">Gestión de información empresarial</p>
            </div>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="shrink-0" variant="outline">
              <Edit2 className="mr-2 h-4 w-4" />
              Editar información
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Solo la tarjeta de moneda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configuración de moneda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Símbolo de moneda</span>
              {isEditing ? (
                <Input
                  name="currency_symbol"
                  value={formData.currency_symbol}
                  onChange={handleChange}
                  placeholder="$, €, £, etc."
                  className="h-16 w-24 text-2xl font-medium"
                />
              ) : (
                <div className="bg-muted/40 flex h-16 w-16 items-center justify-center rounded-md border text-2xl font-medium">
                  {formData.currency_symbol || '$'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">
                El símbolo de moneda se utilizará en todos los reportes y transacciones financieras de la empresa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="bg-background/80 sticky bottom-4 flex justify-end gap-2 rounded-lg border p-4 shadow-sm backdrop-blur-sm">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
