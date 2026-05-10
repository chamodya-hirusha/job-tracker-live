import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions, STAGE_LABELS } from "@/lib/store";
import type { StageStatus } from "@/lib/store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Timeline } from "@/components/Timeline";
import { Check, Loader2, Circle, Save } from "lucide-react";

export const Route = createFileRoute("/admin/stages")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><StagesPage /></AdminLayout>,
});

function StagesPage() {
  const jobs = useStore((s) => s.jobs);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === jobId);
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Update progress visible to customers</p>
        <h1 className="text-3xl font-semibold mt-1">Stage updates</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px]">
            <label className="text-xs text-muted-foreground">Select job</label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    <span className="font-mono">{j.id}</span> — {j.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {job && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold">Stages</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Click a status to update — customer sees changes instantly.</p>
            <div className="mt-4 space-y-3">
              {job.stages.map((s) => (
                <div key={s.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="font-medium text-sm">{STAGE_LABELS[s.key]}</div>
                  <div className="flex gap-1.5">
                    {(["pending","in_progress","completed"] as StageStatus[]).map((st) => {
                      const active = s.status === st;
                      const Icon = st === "completed" ? Check : st === "in_progress" ? Loader2 : Circle;
                      return (
                        <button
                          key={st}
                          onClick={() => storeActions.setStage(job.id, s.key, st)}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                            active
                              ? st === "completed"
                                ? "bg-success text-success-foreground border-success"
                                : st === "in_progress"
                                  ? "bg-accent text-accent-foreground border-accent"
                                  : "bg-muted border-border"
                              : "bg-background border-border hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-3 w-3" /> {st.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <label className="text-xs text-muted-foreground">Customer message (sent on next update)</label>
              <Textarea className="mt-1.5" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="e.g. Material received, manufacturing starts tomorrow." />
              <Button
                className="mt-3"
                onClick={() => {
                  if (!msg.trim()) return;
                  storeActions.updateJob(job.id, { customerMessage: msg.trim() });
                  setMsg("");
                }}
              >
                <Save className="h-4 w-4" /> Save message
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold">Customer view preview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{job.customerMessage}</p>
            <div className="mt-5">
              <Timeline job={job} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}