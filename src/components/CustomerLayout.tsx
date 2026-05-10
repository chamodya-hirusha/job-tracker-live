import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { auth, useSession } from "@/lib/auth";
import { LogOut, LayoutDashboard, Search } from "lucide-react";

export function CustomerLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  const navItem = (to: string, label: string, Icon: typeof Search) => {
    const active = path === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo to="/dashboard" />
            <nav className="hidden sm:flex items-center gap-1">
              {navItem("/dashboard", "Dashboard", LayoutDashboard)}
              {navItem("/track", "Track Job", Search)}
            </nav>
            <div className="hidden lg:block h-4 w-px bg-border mx-2" />
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-none">Customer</div>
              <div className="text-sm font-semibold mt-1">{session?.name}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>

        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}