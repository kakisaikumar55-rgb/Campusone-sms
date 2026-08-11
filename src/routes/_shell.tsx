import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Search } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "AD";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/85 sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-3 py-2.5 backdrop-blur sm:px-6">
            <SidebarTrigger />
            <div className="relative hidden min-w-0 sm:block sm:max-w-sm">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search campus records…" className="pl-9" />
            </div>
            <div className="flex shrink-0 items-center gap-2 justify-self-end">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-xs leading-tight sm:block">
                  <span className="block max-w-28 truncate font-medium capitalize">
                    {user?.name ?? "Administrator"}
                  </span>
                  <span className="block text-muted-foreground">Admin</span>
                </span>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
