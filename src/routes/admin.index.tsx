import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, STAGE_LABELS } from "@/lib/store";
import { StageBadge } from "@/components/StageBadge";
import { Users, Briefcase, Loader2, PackageCheck, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

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
  const inMfg = jobs.filter((j) => j.currentStage === "manufacturing").length;
  const inQc = jobs.filter((j) => j.currentStage === "quality_check").length;
  const dispatch = jobs.filter((j) => j.currentStage === "ready_for_dispatch").length;
  const completed = jobs.filter((j) => ["delivered", "completed"].includes(j.currentStage)).length;
  const delayed = jobs.filter((j) => new Date(j.expectedDate) > new Date(j.requiredDate)).length;

  const stats = [
    { label: "Customers", value: customers.length, Icon: Users, tone: "primary" as const },
    { label: "Total Jobs", value: jobs.length, Icon: Briefcase, tone: "primary" as const },
    { label: "Manufacturing", value: inMfg, Icon: Loader2, tone: "info" as const },
    { label: "Quality Check", value: inQc, Icon: PackageCheck, tone: "info" as const },
    { label: "Ready for Dispatch", value: dispatch, Icon: PackageCheck, tone: "warning" as const },
    { label: "Completed", value: completed, Icon: CheckCircle2, tone: "success" as const },
    { label: "Delayed", value: delayed, Icon: AlertTriangle, tone: "destructive" as const },
  ];

  const toneMap = {
    primary: "bg-primary/5 text-primary",
    info: "bg-info/10 text-info",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Operations dashboard</p>
        <h1 className="text-3xl font-semibold mt-1">Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneMap[s.tone]}`}>
              <s.Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Active jobs</h2>
          <Link to="/admin/jobs" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Job</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Stage</th>
                <th className="text-left px-5 py-3 font-medium">Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.slice(0, 8).map((j) => {
                const c = customers.find((c) => c.id === j.customerId);
                return (
                  <tr key={j.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="font-mono font-medium">{j.id}</div>
                      <div className="text-xs text-muted-foreground">{j.productName}</div>
                    </td>
                    <td className="px-5 py-3">{c?.name ?? "—"}</td>
                    <td className="px-5 py-3"><StageBadge stage={j.currentStage} status="in_progress" /></td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{j.expectedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Stages tracked: {Object.values(STAGE_LABELS).join(" › ")}
        </p>
      </div>
    </div>
  );
}