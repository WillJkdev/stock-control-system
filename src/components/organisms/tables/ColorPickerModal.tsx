import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CirclePicker } from 'react-color';

interface ColorPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  categoryName: string;
}

export function ColorPickerModal({ open, onOpenChange, currentColor, onColorChange, categoryName }: ColorPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar color de {categoryName}</DialogTitle>
          <DialogDescription>Selecciona un nuevo color para la categoría. El cambio se aplicará después de confirmar.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <CirclePicker color={currentColor} onChange={(color) => onColorChange(color.hex)} />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: currentColor }} />
            <span>{currentColor}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
