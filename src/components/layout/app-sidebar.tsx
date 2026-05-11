import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups } from "./nav-config";
import logoFull from "@/assets/greenlink-full.png";
import logoMark from "@/assets/greenlink-mark.png";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {collapsed ? (
            <img src={logoMark} alt="GreenLink" className="h-7 w-7" />
          ) : (
            <img src={logoFull} alt="GreenLink" className="h-8 w-auto" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = !item.soon && pathname.startsWith(item.url);
                  if (item.soon) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton disabled className="opacity-60 cursor-not-allowed">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {!collapsed && <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">em breve</Badge>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1.5 text-xs text-sidebar-foreground/60">
          {!collapsed && "GreenLink ADM v0.1"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
