import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions, STAGE_LABELS, STAGE_ORDER } from "@/lib/store";
import type { StageKey, StageStatus } from "@/lib/store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HorizontalTimeline } from "@/components/HorizontalTimeline";
import { Check, Loader2, Circle, Save, GitBranch, Info } from "lucide-react";

export const Route = createFileRoute("/admin/stages")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><StagesPage /></AdminLayout>,
});

const STATUS_META: Record<StageStatus, { label: string; Icon: typeof Check; activeCls: string }> = {
  pending:     { label: "Pending",     Icon: Circle,   activeCls: "bg-muted border-border text-foreground" },
  in_progress: { label: "In Progress", Icon: Loader2,  activeCls: "bg-amber-50 border-amber-300 text-amber-700" },
  completed:   { label: "Completed",   Icon: Check,    activeCls: "bg-emerald-50 border-emerald-400 text-emerald-700" },
};

function StagesPage() {
  const jobs = useStore((s) => s.jobs);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === jobId);
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);

  const saveMsg = () => {
    if (!msg.trim() || !job) return;
    storeActions.updateJob(job.id, { customerMessage: msg.trim() });
    setMsg("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Admin Panel</p>
        <h1 className="text-3xl font-bold mt-1">Stage Updates</h1>
      </div>

      {/* Job picker */}
      <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[260px]">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Select Job</label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    <span className="font-mono">{j.id}</span> — {j.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {job && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">
              <GitBranch className="h-3.5 w-3.5" />
              Current: <span className="font-semibold text-foreground">{STAGE_LABELS[job.currentStage]}</span>
            </div>
          )}
        </div>
      </div>

      {job && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Stage Controls — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Stage Controls</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Click a status button to update — customers see the change instantly.</p>

              <div className="space-y-2">
                {job.stages.map((s) => {
                  const isCurrentStage = job.currentStage === s.key;
                  return (
                    <div
                      key={s.key}
                      className={`rounded-lg border p-3 transition-colors ${isCurrentStage ? "border-primary/30 bg-primary/3" : "border-border"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isCurrentStage ? "text-foreground" : "text-muted-foreground"}`}>
                              {STAGE_LABELS[s.key]}
                            </span>
                            {isCurrentStage && (
                              <span className="rounded-full bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                                Current
                              </span>
                            )}
                          </div>
                          {s.date && <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{s.date}</div>}
                        </div>
                        <div className="flex gap-1.5">
                          {(["pending", "in_progress", "completed"] as StageStatus[]).map((st) => {
                            const active = s.status === st;
                            const m = STATUS_META[st];
                            return (
                              <button
                                key={st}
                                onClick={() => storeActions.setStage(job.id, s.key, st)}
                                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                                  active ? m.activeCls : "bg-background border-border text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                <m.Icon className="h-3 w-3" /> {m.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer message panel */}
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-sm font-semibold mb-1">Customer Notification Message</h3>
              <p className="text-xs text-muted-foreground mb-3">This message is visible to the customer on the tracking page.</p>
              <Textarea
                rows={3}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="e.g. Material received. Manufacturing starts tomorrow."
                className="resize-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <Button
                  onClick={saveMsg}
                  disabled={!msg.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" /> Save Message
                </Button>
                {saved && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Saved!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Preview panel — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-sm font-semibold mb-1">Customer View Preview</h3>
              <p className="text-xs text-muted-foreground mb-4">This is exactly what the customer sees.</p>

              {/* Current message */}
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 flex gap-2.5 mb-5">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">{job.customerMessage}</p>
              </div>

              {/* Horizontal timeline preview */}
              <HorizontalTimeline job={job} />
            </div>

            {/* Stage summary */}
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-sm font-semibold mb-3">Stage Summary</h3>
              <div className="space-y-1.5">
                {job.stages.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-xs">
                    <span className={s.status === "pending" ? "text-muted-foreground" : "text-foreground"}>
                      {STAGE_LABELS[s.key]}
                    </span>
                    <span className={`font-medium ${
                      s.status === "completed" ? "text-emerald-600" :
                      s.status === "in_progress" ? "text-amber-600" : "text-muted-foreground"
                    }`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}