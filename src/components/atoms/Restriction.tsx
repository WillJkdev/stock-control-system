import { LockKeyhole } from 'lucide-react';

interface RestrictionMsgProps {
  show?: boolean;
}

export function RestrictionMsg({ show = true }: RestrictionMsgProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-gray-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white">
        <LockKeyhole className="h-6 w-6 text-red-500" />
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
      </div>
      <p className="mt-2 text-sm text-gray-300">No tienes permisos para ver esta sección.</p>
    </div>
  );
}
