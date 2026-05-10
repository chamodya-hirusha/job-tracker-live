import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/auth";
import { Package, ShieldCheck, Truck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("customer@abc.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const s = auth.loginCustomer(email, password);
    if (!s) {
      setError("Invalid email or password.");
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-sidebar-foreground relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <Logo invert />
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Real-time visibility into every order you place.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70">
            From quotation to delivery — track manufacturing progress, download documents, and stay informed at every stage.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              { Icon: Package, t: "Live order status" },
              { Icon: Truck, t: "Stage-by-stage tracking" },
              { Icon: ShieldCheck, t: "Secure document access" },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-md bg-sidebar-accent/40 flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/50 relative z-10">
          © 2026 JobTrack. SAP-ready manufacturing portal.
        </div>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Customer sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to track your jobs.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email or customer code</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</button>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" required />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">Sign in</Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">Demo credentials</div>
            <div className="font-mono">customer@abc.com / 123456</div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Admin user? <Link to="/admin/login" className="text-foreground font-medium hover:underline">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}