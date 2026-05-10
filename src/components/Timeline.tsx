import type { Job } from "@/lib/store";
import { STAGE_LABELS } from "@/lib/store";
import { Check, Loader2, Circle } from "lucide-react";

export function Timeline({ job }: { job: Job }) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
      <ul className="space-y-5">
        {job.stages.map((s) => {
          const done = s.status === "completed";
          const active = s.status === "in_progress";
          return (
            <li key={s.key} className="relative flex gap-4">
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "bg-success border-success text-success-foreground"
                    : active
                      ? "bg-accent border-accent text-accent-foreground"
                      : "bg-background border-border text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className={`font-medium ${active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {STAGE_LABELS[s.key]}
                  </h4>
                  {s.date && (
                    <span className="text-xs text-muted-foreground font-mono">{s.date}</span>
                  )}
                </div>
                {s.message && <p className="mt-1 text-sm text-muted-foreground">{s.message}</p>}
                {active && !s.message && (
                  <p className="mt-1 text-sm text-accent-foreground/80">Currently in progress</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}