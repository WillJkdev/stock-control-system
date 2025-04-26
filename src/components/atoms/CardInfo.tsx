import { ReactNode } from 'react';

interface CardInfoProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  color: 'slate' | 'green' | 'red' | 'amber';
}

export function CardInfo({ icon, value, label, color }: CardInfoProps) {
  const colors = {
    slate: {
      bg: 'bg-slate-100 group-hover:bg-slate-200',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'text-slate-500',
      divider: 'bg-slate-200',
    },
    green: {
      bg: 'bg-green-100 group-hover:bg-green-200',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'text-green-600',
      divider: 'bg-green-200',
    },
    red: {
      bg: 'bg-red-100 group-hover:bg-red-200',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'text-red-600',
      divider: 'bg-red-200',
    },
    amber: {
      bg: 'bg-amber-100 group-hover:bg-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'text-amber-600',
      divider: 'bg-amber-200',
    },
  };

  const styles = colors[color];

  return (
    <div className={`group overflow-hidden rounded-xl border ${styles.border} bg-white shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center gap-4 p-4">
        <div className={`rounded-full ${styles.bg} p-3 shadow-sm transition-colors`}>{icon}</div>
        <div>
          <div className={`text-2xl font-bold ${styles.text}`}>{value}</div>
          <div className={`text-xs font-medium tracking-wider uppercase ${styles.label}`}>{label}</div>
        </div>
      </div>
      <div className={`h-1 w-full ${styles.divider}`}></div>
    </div>
  );
}
