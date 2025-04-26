import { LockKeyhole } from 'lucide-react';

export function PageRestriction() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-6 text-center">
      <div className="flex items-center gap-3 text-white">
        <LockKeyhole className="h-8 w-8 text-red-500" />
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
      </div>
      <p className="mt-3 text-sm text-gray-300">No tienes permisos para acceder a esta página.</p>
    </div>
  );
}
