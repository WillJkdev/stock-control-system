import { Activity, AudioWaveform, BarChart2, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2 } from 'lucide-react';
import * as React from 'react';

import { ThemeSwitch } from '@/components/atoms/ThemeSwitch';
import { NavMain } from '@/components/molecules/sidebar/NavMain';
import { NavProjects } from '@/components/molecules/sidebar/NavProjects';
import { NavUser } from '@/components/molecules/sidebar/NavUser';
import { TeamSwitcher } from '@/components/molecules/sidebar/TeamSwitcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Kardex',
      url: '/kardex',
      icon: Activity,
      isActive: true,
    },
    {
      title: 'Reportes',
      url: '/reports',
      icon: BarChart2,
      isActive: true,
      items: [
        {
          title: 'Stock Total',
          url: '/reports/total-current-stock',
        },
        {
          title: 'Reporte por Producto',
          url: '/reports/current-stock-product',
        },
        {
          title: 'Bajo Stock',
          url: '/reports/low-stock-report',
        },
        {
          title: 'Movimientos',
          url: '/reports/movements-report',
        },
        {
          title: 'Valuado por Inventario',
          url: '/reports/valued-inventory-report',
        },
      ],
    },

    // {
    //   title: 'Playground',
    //   url: '#',
    //   icon: SquareTerminal,
    //   isActive: true,
    //   items: [
    //     {
    //       title: 'History',
    //       url: '#',
    //     },
    //     {
    //       title: 'Starred',
    //       url: '#',
    //     },
    //     {
    //       title: 'Settings',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Models',
    //   url: '#',
    //   icon: Bot,
    //   items: [
    //     {
    //       title: 'Genesis',
    //       url: '#',
    //     },
    //     {
    //       title: 'Explorer',
    //       url: '#',
    //     },
    //     {
    //       title: 'Quantum',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Documentation',
    //   url: '#',
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: 'Introduction',
    //       url: '#',
    //     },
    //     {
    //       title: 'Get Started',
    //       url: '#',
    //     },
    //     {
    //       title: 'Tutorials',
    //       url: '#',
    //     },
    //     {
    //       title: 'Changelog',
    //       url: '#',
    //     },
    //   ],
    // },
    {
      title: 'Ajustes',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/settings',
        },
        {
          title: 'Productos',
          url: '/settings/products',
        },
        {
          title: 'Personal',
          url: '/settings/staff',
        },
        {
          title: 'Tu Empresa',
          url: '/settings/company',
        },
        {
          title: 'Categorías',
          url: '/settings/categories',
        },
        {
          title: 'Marcas',
          url: '/settings/brands',
        },
        // {
        //   title: 'Reportes',
        //   url: '/settings/reports',
        // },
        // {
        //   title: 'Proveedores',
        //   url: '/settings/suppliers',
        // },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <ThemeSwitch />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
