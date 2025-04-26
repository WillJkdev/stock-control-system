import { SettingCard } from '@/components/molecules/SettingCard';
import { useUserStore } from '@/store/UserStore';
import { Activity, BarChart3, Briefcase, LayoutGrid, Lightbulb, Package, Truck, Users } from 'lucide-react';

const iconMap = {
  Package: <Package className="h-10 w-10 text-gray-300 group-hover:text-amber-400" />,
  Users: <Users className="h-10 w-10 text-gray-300 group-hover:text-blue-400" />,
  Briefcase: <Briefcase className="h-10 w-10 text-gray-300 group-hover:text-indigo-400" />,
  LayoutGrid: <LayoutGrid className="h-10 w-10 text-gray-300 group-hover:text-purple-400" />,
  Lightbulb: <Lightbulb className="h-10 w-10 text-gray-300 group-hover:text-yellow-400" />,
  BarChart3: <BarChart3 className="h-10 w-10 text-gray-300 group-hover:text-green-400" />,
  Truck: <Truck className="h-10 w-10 text-gray-300 group-hover:text-teal-400" />,
  Activity: <Activity className="h-10 w-10 text-gray-300 group-hover:text-yellow-400" />,
};
export function Settings() {
  const { dataModulesConfigWithState } = useUserStore();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dataModulesConfigWithState.map((setting) => (
        <SettingCard
          key={setting.link}
          href={setting.link}
          icon={iconMap[setting.icon as keyof typeof iconMap]}
          title={setting.title}
          description={setting.subtitle}
          isRestricted={!setting.state}
        />
      ))}
    </div>
  );
}
