import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { CustomerLayout } from "@/components/CustomerLayout";
import { useStore } from "@/lib/store";
import { useSession } from "@/lib/auth";
import { Timeline } from "@/components/Timeline";
import { StageBadge } from "@/components/StageBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Phone, Mail, Info } from "lucide-react";

export const Route = createFileRoute("/track/$jobId")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "customer") throw redirect({ to: "/login" });
  },
  component: () => <CustomerLayout><JobView /></CustomerLayout>,
});

function JobView() {
  const { jobId } = Route.useParams();
  const session = useSession();
  const allJobs = useStore((s) => s.jobs);
  const job = useMemo(
    () =>
      allJobs.find(
        (j) =>
          j.id.toUpperCase() === jobId.toUpperCase() &&
          (session?.kind === "customer" ? j.customerId === session.customerId : false),
      ),
    [allJobs, jobId, session],
  );


  if (!job) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl">🔍</div>
        <h1 className="text-2xl font-semibold mt-4">Job not found</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We couldn't find a job with ID <span className="font-mono">{jobId}</span> under your account.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const progress = (job.completedQty / job.quantity) * 100;

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      {/* Hero / order header */}
      <div className="rounded-2xl text-sidebar-foreground p-8 relative overflow-hidden" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-sidebar-foreground/60">Job ID</div>
            <div className="font-mono text-3xl font-semibold mt-1">{job.id}</div>
            <h1 className="text-xl mt-3">{job.productName}</h1>
            <div className="text-sm text-sidebar-foreground/70">{job.description}</div>
          </div>
          <div className="text-right">
            <StageBadge stage={job.currentStage} status="in_progress" />
            <div className="mt-3 text-xs uppercase tracking-wider text-sidebar-foreground/60">Expected completion</div>
            <div className="font-mono text-lg">{job.expectedDate}</div>
          </div>
        </div>
        <div className="relative z-10 mt-6 flex items-start gap-3 rounded-xl bg-sidebar-foreground/10 backdrop-blur p-4 border border-sidebar-foreground/10">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-sidebar-foreground/90">{job.customerMessage}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Order Details">
          <KV k="Customer PO No." v={job.customerPO} />
          <KV k="Sales Order" v={job.salesOrder} />
          <KV k="Quotation" v={job.quotationNo} />
          <KV k="Order Date" v={job.orderDate} />
          <KV k="Required Delivery" v={job.requiredDate} />
          <KV k="Expected Completion" v={job.expectedDate} />
        </Card>
        <Card title="Product Details">
          <KV k="Product Code" v={job.productCode} />
          <KV k="Material" v={job.material} />
          <KV k="Finish" v={job.finish} />
          <KV k="Drawing No." v={job.drawingNo} />
          <KV k="Revision" v={job.revision} />
        </Card>
        <Card title="Production Quantity">
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold tabular-nums">{job.completedQty} / {job.quantity}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{Math.round(progress)}% machined</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="rounded-md bg-success/10 p-3">
                <div className="text-xs text-muted-foreground">Completed</div>
                <div className="text-lg font-semibold text-success tabular-nums">{job.completedQty}</div>
              </div>
              <div className="rounded-md bg-warning/15 p-3">
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-lg font-semibold tabular-nums">{job.quantity - job.completedQty}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Tracking timeline">
            <Timeline job={job} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Documents">
            {job.documents.filter((d) => d.visible).length === 0 && (
              <p className="text-sm text-muted-foreground">No documents available yet.</p>
            )}
            <ul className="space-y-2">
              {job.documents.filter((d) => d.visible).map((d) => (
                <li key={d.id}>
                  <button className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors px-3 py-2.5 text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{d.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Need help?">
            <p className="text-sm text-muted-foreground">Reach out to your account manager.</p>
            <div className="mt-3 space-y-2 text-sm">
              <a className="flex items-center gap-2 hover:text-accent" href="tel:+919999000011"><Phone className="h-4 w-4" /> +91 99990 00011</a>
              <a className="flex items-center gap-2 hover:text-accent" href="mailto:support@jobtrack.io"><Mail className="h-4 w-4" /> support@jobtrack.io</a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium font-mono">{v}</span>
    </div>
  );
}