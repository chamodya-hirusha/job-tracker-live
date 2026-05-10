import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/CustomerLayout";
import { useStore } from "@/lib/store";
import { useSession } from "@/lib/auth";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/StageBadge";
import { Search, ArrowRight, Briefcase, Loader2, PackageCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "customer") throw redirect({ to: "/login" });
  },
  component: () => <CustomerLayout><DashboardPage /></CustomerLayout>,
});

function DashboardPage() {
  const session = useSession();
  const navigate = useNavigate();
  const allJobs = useStore((s) => s.jobs);
  const jobs = useMemo(
    () => allJobs.filter((j) => j.customerId === (session?.kind === "customer" ? session.customerId : "")),
    [allJobs, session],
  );

  const [q, setQ] = useState("");

  const stats = useMemo(() => {
    const inProgress = jobs.filter((j) => !["delivered", "completed", "ready_for_dispatch"].includes(j.currentStage)).length;
    const dispatch = jobs.filter((j) => j.currentStage === "ready_for_dispatch").length;
    const completed = jobs.filter((j) => ["delivered", "completed"].includes(j.currentStage)).length;
    return { total: jobs.length, inProgress, dispatch, completed };
  }, [jobs]);

  const onTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = q.trim().toUpperCase();
    if (id) navigate({ to: "/track/$jobId", params: { jobId: id } });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-semibold mt-1">{session?.name}</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-base font-semibold">Track your job</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Enter a Job ID like <span className="font-mono">JOB-10045</span></p>
        <form onSubmit={onTrack} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter Job ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11 font-mono"
            />
          </div>
          <Button type="submit" size="lg">
            Track <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={stats.total} Icon={Briefcase} tone="primary" />
        <StatCard label="In Progress" value={stats.inProgress} Icon={Loader2} tone="info" />
        <StatCard label="Ready for Dispatch" value={stats.dispatch} Icon={PackageCheck} tone="warning" />
        <StatCard label="Completed" value={stats.completed} Icon={CheckCircle2} tone="success" />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent jobs</h2>
          <span className="text-xs text-muted-foreground">{jobs.length} total</span>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Job ID</th>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Stage</th>
                <th className="text-left px-5 py-3 font-medium">Expected</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium">{j.id}</td>
                  <td className="px-5 py-3">{j.productName}</td>
                  <td className="px-5 py-3"><StageBadge stage={j.currentStage} status="in_progress" /></td>
                  <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{j.expectedDate}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to="/track/$jobId" params={{ jobId: j.id }} className="text-sm font-medium text-foreground hover:text-accent inline-flex items-center gap-1">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No jobs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, Icon, tone }: { label: string; value: number; Icon: typeof Briefcase; tone: "primary" | "info" | "warning" | "success" }) {
  const map = {
    primary: "bg-primary/5 text-primary",
    info: "bg-info/10 text-info",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/10 text-success",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${map[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}