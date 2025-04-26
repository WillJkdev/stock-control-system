import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Modules } from '@/types/types';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MultiSelectCheckboxProps {
  modules: Modules[];
  selectedModules: number[];
  onModulesChange: (moduleIds: number[]) => void;
  placeholder: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function MultiSelectCheckbox({
  modules,
  selectedModules,
  onModulesChange,
  placeholder,
  emptyMessage = 'No se encontraron módulos activos.',
  searchPlaceholder = 'Buscar módulos...',
  className,
}: MultiSelectCheckboxProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>(selectedModules);

  // Filtrar solo los módulos activos (check: true)
  const activeModules = modules.filter((module) => module.check);

  useEffect(() => {
    setSelected(selectedModules);
  }, [selectedModules]);

  const handleSelect = (moduleId: number) => {
    const updatedSelection = selected.includes(moduleId) ? selected.filter((id) => id !== moduleId) : [...selected, moduleId];

    setSelected(updatedSelection);
    onModulesChange(updatedSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>
          <span className="truncate">{selected.length > 0 ? `${selected.length} módulos seleccionados` : placeholder}</span>
          <span className="ml-2 h-4 w-4 shrink-0 opacity-50">{selected.length > 0 && `(${selected.length})`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {activeModules.map((module) => (
              <CommandItem key={module.id} value={module.name} onSelect={() => handleSelect(module.id)}>
                <div className="flex items-center gap-2">
                  <div className="flex h-4 w-4 items-center justify-center rounded border">
                    {selected.includes(module.id) && <Check className="h-3 w-3" />}
                  </div>
                  <span>{module.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
