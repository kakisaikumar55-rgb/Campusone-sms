import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Marks", url: "/marks", icon: ClipboardList },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Profile", url: "/profile", icon: UserCircle },
] as const;

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-sidebar-accent-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-display text-sm font-semibold">CampusOne</span>
            <span className="block truncate text-xs text-sidebar-foreground/60">
              Student Management
            </span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => {
                logout();
                toast.success("You have been signed out");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4 shrink-0" />
              <span className="truncate">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
