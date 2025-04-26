import { Label } from '@/components/ui/label';

export function Field({ label, htmlFor, children, error }: { label: string; htmlFor: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={htmlFor} className="text-right">
        {label}
      </Label>
      <div className="col-span-3 space-y-1">
        {children}
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </div>
  );
}
