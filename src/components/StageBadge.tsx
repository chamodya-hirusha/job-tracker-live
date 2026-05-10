import type { StageKey, StageStatus } from "@/lib/store";
import { STAGE_LABELS } from "@/lib/store";
import { CheckCircle2, Clock, Circle } from "lucide-react";

export function StageBadge({ stage, status }: { stage: StageKey; status?: StageStatus }) {
  const cls =
    status === "completed"
      ? "bg-success/10 text-success border-success/20"
      : status === "in_progress"
        ? "bg-accent/15 text-accent-foreground border-accent/30"
        : "bg-muted text-muted-foreground border-border";
  const Icon = status === "completed" ? CheckCircle2 : status === "in_progress" ? Clock : Circle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {STAGE_LABELS[stage]}
    </span>
  );
}