import { RestrictionMsg } from '@/components/atoms/Restriction';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface SettingCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  isRestricted?: boolean;
}

export function SettingCard({ href, icon, title, description, isRestricted = false }: SettingCardProps) {
  const commonProps = {
    className: `group relative flex flex-col rounded-xl border border-gray-800 p-6 transition-all duration-300 hover:bg-gray-200 hover:ring-2 hover:ring-rose-600 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800 ${
      isRestricted ? 'pointer-events-none' : ''
    }`,
    children: (
      <>
        <RestrictionMsg show={isRestricted} />
        <div className="mb-4 transition-colors duration-300 group-hover:text-rose-400">{icon}</div>
        <h2 className="mb-1 text-xl font-semibold dark:text-white">{title}</h2>
        <p className="text-sm dark:text-gray-400">{description}</p>
        <div className="absolute right-4 bottom-4 translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="h-5 w-5 dark:text-gray-400" />
        </div>
      </>
    ),
  };

  return isRestricted ? <div {...commonProps} /> : <Link {...commonProps} to={href} />;
}
