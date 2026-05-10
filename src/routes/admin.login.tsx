import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/auth";
import { AlertCircle, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});


function AdminLogin() {
  const navigate = useNavigate();
  const [u, setU] = useState("admin");
  const [p, setP] = useState("admin");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.loginAdmin(u, p)) navigate({ to: "/admin" });
    else setError("Invalid admin credentials.");
  };

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.6 }} />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo invert /></div>
        <div className="rounded-2xl bg-card text-card-foreground p-8" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-widest">
            <Lock className="h-3.5 w-3.5" /> Admin Access
          </div>
          <h1 className="text-2xl font-semibold mt-2">Operations sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customers, jobs and stages.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={u} onChange={(e) => setU(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} className="mt-1.5" />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">Sign in to admin</Button>
          </form>
          <div className="mt-5 text-center text-xs text-muted-foreground">
            Customer? <Link to="/login" className="text-foreground font-medium hover:underline">Sign in here</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-sidebar-foreground/50 font-mono">demo: admin / admin</p>
      </div>
    </div>
  );
}