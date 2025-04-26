import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react'; // Usando iconos de Lucide

export function ActionConfirmation({
  open,
  setOpen,
  onConfirm,
  onCancel,
  actionType,
  itemName,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  actionType: 'delete' | 'edit';
  itemName: string;
}) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  const getTitle = () => {
    return actionType === 'delete' ? 'Confirmar eliminación' : 'Confirmar cambios';
  };

  const getDescription = () => {
    return actionType === 'delete'
      ? `¿Estás seguro que deseas eliminar ${itemName}? Esta acción no se puede deshacer.`
      : `¿Deseas guardar los cambios realizados a ${itemName}?`;
  };

  const getIcon = () => {
    const iconClass = 'mx-auto h-12 w-12 mb-4';

    if (actionType === 'delete') {
      return <AlertTriangle className={`${iconClass} text-destructive`} />;
    }
    return <Edit className={`${iconClass} text-primary`} />;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="text-center">
          {getIcon()}
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-center text-lg font-semibold">{getTitle()}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center text-sm">{getDescription()}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex flex-row justify-center gap-3 sm:justify-center">
            <Button variant="outline" onClick={handleCancel} className="px-6">
              Cancelar
            </Button>
            <Button
              variant={actionType === 'delete' ? 'destructive' : 'default'}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className="gap-2 px-6"
            >
              {actionType === 'delete' ? (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
