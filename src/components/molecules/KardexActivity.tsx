import { CardContent } from '@/components/ui/card';
import { KardexView } from '@/types/types';
import { Ban, Package } from 'lucide-react';

type Props = {
  movements: Partial<KardexView>[];
};

export function KardexActivity({ movements }: Props) {
  return (
    <CardContent>
      <div className="space-y-4">
        {movements.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">No hay movimientos recientes.</p>
        ) : (
          movements.map((movement) => {
            const isIngreso = movement.movement_type === 'input';
            const isAnulado = movement.details === 'Movimiento anulado';
            return (
              <div key={movement.id} className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isAnulado ? 'bg-orange-600' : isIngreso ? 'bg-green-700' : 'bg-red-700'
                  }`}
                >
                  {isAnulado ? <Ban className="h-5 w-5 text-white" /> : <Package className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <p className="font-medium">
                    {isIngreso ? 'Ingreso' : 'Salida'} de{' '}
                    <span className={`font-semibold ${isAnulado ? 'text-orange-500 line-through' : ''}`}>{movement.description}</span> (
                    {movement.quantity})
                  </p>
                  <p className="text-sm text-gray-400">
                    {movement.date ? new Date(movement.date).toLocaleString() : ''} - Por {movement.user_name}
                  </p>
                  <p className="text-xs text-gray-500 italic">{movement.details}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CardContent>
  );
}
