import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronRight, Home, type LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        <NavLink to="/" className="w-full">
          {({ isActive }) => (
            <SidebarMenuButton asChild isActive={isActive}>
              <div className="flex items-center gap-2">
                <Home className={isActive ? 'text-yellow-400' : 'text-gray-300'} />
                <span>Home</span>
              </div>
            </SidebarMenuButton>
          )}
        </NavLink>

        {items.map((item) => {
          const isSubmenuActive = item.items?.some((subItem) => location.pathname.startsWith(subItem.url));

          if (item.items) {
            return (
              <Collapsible key={item.title} asChild defaultOpen={isSubmenuActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isSubmenuActive ? 'dark:bg-gray-800 dark:text-white' : ''}>
                      {item.icon && <item.icon className={isSubmenuActive ? 'text-blue-400' : 'text-gray-300'} />}
                      <span>{item.title}</span>
                      <ChevronRight className={`ml-auto transition-transform duration-200 ${isSubmenuActive ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <NavLink to={subItem.url} className="w-full">
                            {() => {
                              // Comparación manual exacta
                              const isExactActive = location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubButton asChild isActive={isExactActive}>
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              );
                            }}
                          </NavLink>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          } else {
            return (
              <NavLink key={item.title} to={item.url} className="w-full">
                {({ isActive }) => (
                  <SidebarMenuButton asChild isActive={isActive}>
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className={isActive ? 'text-yellow-400' : 'text-gray-300'} />}
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                )}
              </NavLink>
            );
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
