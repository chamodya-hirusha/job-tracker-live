import { Link } from "@tanstack/react-router";

export function Logo({ to = "/", invert = false }: { to?: string; invert?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <div
        className={`relative h-9 w-9 rounded-lg flex items-center justify-center font-bold text-base ${
          invert ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
        }`}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <span className="font-mono">JT</span>
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
      </div>
      <div className="leading-tight">
        <div className={`font-semibold text-[15px] tracking-tight ${invert ? "text-sidebar-foreground" : "text-foreground"}`}>
          JobTrack
        </div>
        <div className={`text-[10px] uppercase tracking-widest ${invert ? "text-sidebar-foreground/60" : "text-muted-foreground"}`}>
          Order Visibility
        </div>
      </div>
    </Link>
  );
}