import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { CustomerLayout } from "@/components/CustomerLayout";
import { useStore } from "@/lib/store";
import { useSession } from "@/lib/auth";
import { HorizontalTimeline } from "@/components/HorizontalTimeline";
import { StageBadge } from "@/components/StageBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileDown,
  Phone,
  Mail,
  Info,
  Calendar,
  Package,
  ClipboardList,
  Truck,
  Bell,
  Download,
  Hash,
  Layers,
  BarChart3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/track/$jobId")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "customer") throw redirect({ to: "/login" });
  },
  component: () => <CustomerLayout><JobView /></CustomerLayout>,
});

/* ─────────────────────────────────────────────────────────── helpers ── */

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function docTypeIcon(type: string): string {
  switch (type) {
    case "quotation":    return "📄";
    case "drawing":      return "📐";
    case "invoice":      return "🧾";
    case "delivery_note": return "📦";
    case "po":           return "📋";
    default:             return "📁";
  }
}

function docTypePill(type: string) {
  const map: Record<string, { label: string; cls: string }> = {
    quotation:     { label: "QUOTATION", cls: "bg-blue-50 text-blue-600 border-blue-100" },
    drawing:       { label: "DRAWING",   cls: "bg-violet-50 text-violet-600 border-violet-100" },
    invoice:       { label: "INVOICE",   cls: "bg-amber-50 text-amber-600 border-amber-100" },
    delivery_note: { label: "DELIVERY",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    po:            { label: "PO",        cls: "bg-sky-50 text-sky-600 border-sky-100" },
  };
  const d = map[type] ?? { label: "DOC", cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${d.cls}`}>
      {d.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────── main view ── */

function JobView() {
  const { jobId } = Route.useParams();
  const session   = useSession();
  const allJobs   = useStore((s) => s.jobs);
  const job       = useMemo(
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
      <div className="max-w-md mx-auto text-center py-20">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-5">🔍</div>
        <h1 className="text-2xl font-semibold">Job not found</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We couldn't find a job with ID <span className="font-mono font-semibold">{jobId}</span> under your account.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const progress     = job.quantity > 0 ? Math.round((job.completedQty / job.quantity) * 100) : 0;
  const remainingDays = daysUntil(job.expectedDate);
  const visibleDocs  = job.documents.filter((d) => d.visible);
  const pendingQty   = job.quantity - job.completedQty;

  // SVG circle progress params
  const r  = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * (progress / 100);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      {/* ══════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl text-sidebar-foreground p-7"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-96 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10">
          {/* top row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-sidebar-foreground/55 font-medium">
                <Hash className="h-3 w-3" /> Order Tracking
              </div>
              <div className="font-mono text-3xl font-bold mt-1 tracking-tight">{job.id}</div>
              <h1 className="text-lg font-semibold mt-2">{job.productName}</h1>
              <p className="text-sm text-sidebar-foreground/65 mt-0.5">{job.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StageBadge stage={job.currentStage} status="in_progress" />
              <div className="text-right mt-1">
                <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50">Expected delivery</div>
                <div className="font-mono text-xl font-semibold">{job.expectedDate}</div>
              </div>
              {remainingDays > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/10 px-3 py-1 text-xs">
                  <Calendar className="h-3 w-3 text-accent" />
                  <span className="font-medium">{remainingDays} days remaining</span>
                </div>
              )}
            </div>
          </div>

          {/* progress bar row */}
          <div className="mt-5 rounded-xl bg-white/8 backdrop-blur border border-white/10 p-4">
            <div className="flex items-center justify-between text-xs text-sidebar-foreground/70 mb-2">
              <span>Production progress</span>
              <span className="font-mono font-semibold text-sidebar-foreground">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, oklch(0.62 0.16 155), oklch(0.52 0.14 165))",
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-sidebar-foreground/55 font-mono">
              <span>{job.completedQty} machined</span>
              <span>{pendingQty} remaining</span>
            </div>
          </div>

          {/* customer message */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-white/8 border border-white/10 p-3.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
            <p className="text-sm text-sidebar-foreground/90 leading-relaxed">{job.customerMessage}</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ROW 1 — Order Summary + Product Details + Right Panel
      ══════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Order Summary Card */}
        <SectionCard
          icon={<ClipboardList className="h-4 w-4" />}
          title="Order Summary"
          accent="blue"
        >
          <div className="space-y-0.5">
            <KV k="Job ID"           v={job.id} mono />
            <KV k="Customer PO"       v={job.customerPO} mono />
            <KV k="Sales Order"       v={job.salesOrder} mono />
            <KV k="Quotation No."     v={job.quotationNo} mono />
            <KV k="Order Date"        v={job.orderDate} mono />
            <KV k="Required Delivery" v={job.requiredDate} mono />
            <KV k="Expected Date"     v={job.expectedDate} mono />
            <KV k="Remaining Days" v={`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`} />
            <KV k="Progress"       v={`${progress}%`} />
          </div>
          {/* Status badge row */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current stage</span>
            <StageBadge stage={job.currentStage} status="in_progress" />
          </div>
        </SectionCard>

        {/* Product Details Card */}
        <SectionCard
          icon={<Package className="h-4 w-4" />}
          title="Product Details"
          accent="violet"
        >
          <div className="space-y-0.5">
            <KV k="Product Name"     v={job.productName} />
            <KV k="Product Code"     v={job.productCode} mono />
            <KV k="Material"         v={job.material} />
            <KV k="Finish"           v={job.finish} />
            <KV k="Drawing No."      v={job.drawingNo} mono />
            <KV k="Revision"         v={job.revision} mono />
          </div>
          {/* Quantity block */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="grid grid-cols-3 gap-2">
              <QuantityChip label="Ordered"   value={job.quantity}      tone="neutral" />
              <QuantityChip label="Completed" value={job.completedQty}  tone="success" />
              <QuantityChip label="Pending"   value={pendingQty}        tone="warning" />
            </div>
          </div>
        </SectionCard>

        {/* Right Summary Panel */}
        <div className="flex flex-col gap-5">
          {/* Circular progress */}
          <SectionCard icon={<BarChart3 className="h-4 w-4" />} title="Completion Status" accent="emerald">
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="relative">
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle
                    cx="55" cy="55" r={r}
                    fill="none"
                    stroke="oklch(0.91 0.012 250)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="55" cy="55" r={r}
                    fill="none"
                    stroke={progress === 100 ? "oklch(0.62 0.16 155)" : "oklch(0.42 0.1 240)"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeDashoffset={circ * 0.25}
                    className="transition-all duration-700"
                  />
                  <text x="55" y="50" textAnchor="middle" className="font-semibold" fill="currentColor" fontSize="18" fontWeight="700">
                    {progress}%
                  </text>
                  <text x="55" y="67" textAnchor="middle" fill="oklch(0.48 0.025 250)" fontSize="9.5" fontWeight="500">
                    COMPLETE
                  </text>
                </svg>
              </div>
              <div className="w-full space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Est. completion</span>
                  <span className="font-mono text-xs font-semibold">{job.expectedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Days remaining</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                      remainingDays <= 3
                        ? "bg-destructive/10 text-destructive"
                        : remainingDays <= 7
                          ? "bg-warning/15 text-warning-foreground"
                          : "bg-success/10 text-success"
                    }`}
                  >
                    {remainingDays}d
                  </span>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <a
                href="tel:+919999000011"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-muted px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                Contact Support
              </a>
              <button
                disabled={visibleDocs.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-muted px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                Download All Docs
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ROW 2 — Horizontal Timeline (full width)
      ══════════════════════════════════════════════ */}
      <SectionCard icon={<Layers className="h-4 w-4" />} title="Order Progress Timeline" accent="blue">
        <HorizontalTimeline job={job} />
        {/* stage legend */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
            Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.42_0.1_240)]" />
            In Progress
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            Pending
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════
          ROW 3 — Delivery Info + Customer Message
      ══════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Delivery Information */}
        <SectionCard icon={<Truck className="h-4 w-4" />} title="Delivery Information" accent="sky">
          <div className="space-y-0.5">
            <KV k="Dispatch Status"       v={job.dispatchStatus ?? "—"} />
            <KV k="Vehicle / Courier No." v={job.vehicleNumber ?? "—"} mono />
            <KV k="Tracking Reference"    v={job.trackingRef ?? "—"} mono />
            <KV k="Expected Dispatch"     v={job.expectedDispatchDate ?? "—"} mono />
          </div>

          {/* Visual status pill */}
          <div className="mt-4 pt-3 border-t border-border/60">
            {(() => {
              const status = (job.dispatchStatus ?? "").toLowerCase();
              if (status === "delivered") {
                return (
                  <div className="flex items-center gap-2 rounded-lg bg-success/8 border border-success/20 px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm font-medium text-success">Shipment delivered successfully</span>
                  </div>
                );
              }
              if (status === "scheduled") {
                return (
                  <div className="flex items-center gap-2 rounded-lg bg-info/8 border border-info/20 px-3 py-2.5">
                    <Truck className="h-4 w-4 text-info shrink-0" />
                    <span className="text-sm font-medium text-info">Dispatch is scheduled</span>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-2 rounded-lg bg-muted border border-border px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Dispatch not yet initiated</span>
                </div>
              );
            })()}
          </div>
        </SectionCard>

        {/* Customer Message */}
        <SectionCard icon={<Bell className="h-4 w-4" />} title="Order Notification" accent="amber">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                  Status Update
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{job.customerMessage}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              For real-time updates or urgent queries, please contact our support team.
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href="tel:+919999000011"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> +91 99990 00011
              </a>
              <a
                href="mailto:support@jobtrack.io"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs font-medium transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Email Support
              </a>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ══════════════════════════════════════════════
          ROW 4 — Documents
      ══════════════════════════════════════════════ */}
      <SectionCard icon={<FileDown className="h-4 w-4" />} title="Order Documents" accent="violet">
        {visibleDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">📂</div>
            <p className="text-sm text-muted-foreground">No documents are available yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {visibleDocs.map((doc) => (
              <button
                key={doc.id}
                className="group relative flex flex-col items-center gap-2.5 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-primary/3 hover:shadow-md transition-all duration-200 p-4 text-left"
              >
                <div className="text-3xl leading-none select-none">{docTypeIcon(doc.type)}</div>
                <div className="w-full">
                  <div className="text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1.5 text-center">
                    {doc.name}
                  </div>
                  <div className="flex justify-center">{docTypePill(doc.type)}</div>
                </div>
                <div className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground px-2 py-1 text-[11px] font-medium transition-colors">
                  <FileDown className="h-3 w-3" /> Download PDF
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── sub-components ── */

type AccentColor = "blue" | "violet" | "emerald" | "sky" | "amber" | "neutral";

const accentBorder: Record<AccentColor, string> = {
  blue:    "border-l-[3px] border-l-[oklch(0.55_0.12_250)]",
  violet:  "border-l-[3px] border-l-[oklch(0.55_0.18_290)]",
  emerald: "border-l-[3px] border-l-[var(--success)]",
  sky:     "border-l-[3px] border-l-[oklch(0.62_0.14_240)]",
  amber:   "border-l-[3px] border-l-[oklch(0.78_0.16_70)]",
  neutral: "",
};

function SectionCard({
  title,
  icon,
  accent = "neutral",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: AccentColor;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 ${accentBorder[accent]}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KV({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{k}</span>
      <span className={`text-xs font-medium text-right ${mono ? "font-mono" : ""}`}>{v || "—"}</span>
    </div>
  );
}

function QuantityChip({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "neutral" }) {
  const cls = {
    success: "bg-success/8 border-success/20 text-success",
    warning: "bg-warning/12 border-warning/25 text-warning-foreground",
    neutral: "bg-muted border-border text-foreground",
  }[tone];
  return (
    <div className={`rounded-lg border ${cls} px-2 py-2.5 text-center`}>
      <div className="text-lg font-bold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] font-medium mt-1 uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}