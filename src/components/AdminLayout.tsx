import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { auth, useSession } from "@/lib/auth";
import { LayoutDashboard, Users, Briefcase, GitBranch, LogOut, FileText, Database } from "lucide-react";



export function AdminLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onLogout = () => {
    auth.logout();
    navigate({ to: "/admin/login" });
  };

  const items = [
    { to: "/admin", label: "Overview", Icon: LayoutDashboard },
    { to: "/admin/customers", label: "Customers", Icon: Users },
    { to: "/admin/jobs", label: "Jobs", Icon: Briefcase },
    { to: "/admin/stages", label: "Stage Updates", Icon: GitBranch },
    { to: "/admin/documents", label: "Documents", Icon: FileText },
    { to: "/admin/sap", label: "SAP Integration", Icon: Database },
  ];



  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 h-16 flex items-center border-b border-sidebar-border">
          <Logo to="/admin" invert />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map(({ to, label, Icon }) => {
            const active = path === to || (to !== "/admin" && path.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-2 py-2">
            <div className="text-sm font-medium">{session?.name}</div>
            <div className="text-xs text-sidebar-foreground/60">Admin</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}