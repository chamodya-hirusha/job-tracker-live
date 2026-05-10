import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, STAGE_LABELS, STAGE_ORDER } from "@/lib/store";
import { StageBadge } from "@/components/StageBadge";
import {
  Users, Briefcase, Loader2, PackageCheck, AlertTriangle,
  CheckCircle2, ArrowRight, TrendingUp, Clock, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><AdminOverview /></AdminLayout>,
});

function AdminOverview() {
  const { customers, jobs } = useStore((s) => s);

  const inMfg      = jobs.filter((j) => j.currentStage === "manufacturing").length;
  const inQc       = jobs.filter((j) => j.currentStage === "quality_check").length;
  const dispatch   = jobs.filter((j) => j.currentStage === "ready_for_dispatch").length;
  const completed  = jobs.filter((j) => ["delivered", "completed"].includes(j.currentStage)).length;
  const delayed    = jobs.filter((j) => new Date(j.expectedDate) > new Date(j.requiredDate)).length;
  const totalQty   = jobs.reduce((a, j) => a + j.quantity, 0);
  const doneQty    = jobs.reduce((a, j) => a + j.completedQty, 0);
  const overallPct = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 0;

  const stats = [
    { label: "Total Customers",      value: customers.length, sub: "registered accounts", Icon: Users,        tone: "blue"    },
    { label: "Active Jobs",           value: jobs.length,      sub: "across all customers", Icon: Briefcase,   tone: "indigo"  },
    { label: "In Manufacturing",      value: inMfg,            sub: "on shop floor",        Icon: Loader2,     tone: "sky"     },
    { label: "Quality Check",         value: inQc,             sub: "awaiting QC",          Icon: PackageCheck,tone: "violet"  },
    { label: "Ready for Dispatch",    value: dispatch,         sub: "to be shipped",        Icon: PackageCheck, tone: "amber"  },
    { label: "Delivered",             value: completed,        sub: "orders completed",     Icon: CheckCircle2, tone: "green"  },
    { label: "Delayed Orders",        value: delayed,          sub: "past required date",   Icon: AlertTriangle,tone: "red"    },
    { label: "Overall Progress",      value: `${overallPct}%`, sub: `${doneQty}/${totalQty} units`, Icon: TrendingUp, tone: "emerald" },
  ] as const;

  const toneMap: Record<string, { bg: string; text: string; border: string }> = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-l-blue-400" },
    indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-l-indigo-400" },
    sky:     { bg: "bg-sky-50",     text: "text-sky-600",     border: "border-l-sky-400" },
    violet:  { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-l-violet-400" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-l-amber-400" },
    green:   { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-400" },
    red:     { bg: "bg-red-50",     text: "text-red-500",     border: "border-l-red-400" },
    emerald: { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-l-teal-400" },
  };

  // Stage distribution counts for the visual bar
  const stageCounts = STAGE_ORDER.slice(0, 7).map((k) => ({
    key: k,
    label: STAGE_LABELS[k],
    count: jobs.filter((j) => j.currentStage === k).length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Operations Dashboard</p>
          <h1 className="text-3xl font-bold mt-1">Overview</h1>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
          <div>Live data from store</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const t = toneMap[s.tone];
          return (
            <div
              key={s.label}
              className={`rounded-xl border border-border border-l-4 ${t.border} bg-card p-5 hover:shadow-md transition-shadow`}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${t.bg} ${t.text}`}>
                <s.Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-2xl font-bold tabular-nums">{s.value}</div>
              <div className="text-xs font-medium text-foreground mt-0.5">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Stage distribution */}
      <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Stage Distribution</h2>
        </div>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {stageCounts.map(({ key, label, count }) =>
            count > 0 ? (
              <div
                key={key}
                title={`${label}: ${count}`}
                className="flex items-center justify-center text-[10px] font-semibold text-white transition-all"
                style={{
                  flex: count,
                  background: key === "delivered" ? "oklch(0.62 0.16 155)" :
                              key === "manufacturing" ? "oklch(0.42 0.1 240)" :
                              key === "quality_check" ? "oklch(0.55 0.18 290)" :
                              key === "ready_for_dispatch" ? "oklch(0.78 0.16 70)" :
                              key === "order_confirmed" ? "oklch(0.55 0.12 250)" :
                              "oklch(0.62 0.14 240)",
                }}
              >
                {count}
              </div>
            ) : null
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {stageCounts.filter(s => s.count > 0).map(({ label, count }) => (
            <span key={label} className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">{count}</span> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Active jobs table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Active Jobs</h2>
          </div>
          <Link to="/admin/jobs" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Job / Product</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Progress</th>
                <th className="text-left px-5 py-3 font-medium">Stage</th>
                <th className="text-left px-5 py-3 font-medium">Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.slice(0, 8).map((j) => {
                const c = customers.find((c) => c.id === j.customerId);
                const pct = j.quantity > 0 ? Math.round((j.completedQty / j.quantity) * 100) : 0;
                return (
                  <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs font-semibold">{j.id}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{j.productName}</div>
                    </td>
                    <td className="px-5 py-3 text-sm">{c?.name ?? "—"}</td>
                    <td className="px-5 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-[oklch(0.62_0.16_155)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StageBadge stage={j.currentStage} status="in_progress" /></td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{j.expectedDate}</td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No jobs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Stages: {Object.values(STAGE_LABELS).join(" › ")}
        </p>
      </div>
    </div>
  );
}