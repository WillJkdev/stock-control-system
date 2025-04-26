import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface ListGeneProps {
  data: { id: number; description: ReactNode; searchValue?: string }[];
  value: number;
  onValueChange: (value: number) => void;
  placeholder: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function ListGene({
  data,
  value,
  onValueChange,
  placeholder,
  emptyMessage = 'No se encontraron resultados.',
  searchPlaceholder = 'Buscar...',
  className,
}: ListGeneProps) {
  const [open, setOpen] = useState(false);

  const selectedItem = data.find((item) => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>
          {selectedItem ? selectedItem.description : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {data.map((item) => (
              <CommandItem
                key={item.id}
                value={item.searchValue ?? (typeof item.description === 'string' ? item.description : '')}
                onSelect={() => {
                  onValueChange(item.id);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', value === item.id ? 'opacity-100' : 'opacity-0')} />
                {item.description}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
