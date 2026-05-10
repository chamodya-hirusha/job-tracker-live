import type { Job, StageKey, StageStatus } from "@/lib/store";
import { STAGE_LABELS } from "@/lib/store";
import {
  FileText,
  ClipboardCheck,
  PackageSearch,
  Cog,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";

const STAGE_ICONS: Record<StageKey, React.ElementType> = {
  quotation: FileText,
  order_confirmed: ClipboardCheck,
  material_procurement: PackageSearch,
  manufacturing: Cog,
  quality_check: ShieldCheck,
  ready_for_dispatch: Truck,
  delivered: CheckCircle2,
  completed: CheckCircle2,
};

function stageStatus(job: Job, key: StageKey): StageStatus {
  const entry = job.stages.find((s) => s.key === key);
  return entry?.status ?? "pending";
}

function stageDate(job: Job, key: StageKey): string | undefined {
  return job.stages.find((s) => s.key === key)?.date;
}

const VISIBLE_STAGES: StageKey[] = [
  "quotation",
  "order_confirmed",
  "material_procurement",
  "manufacturing",
  "quality_check",
  "ready_for_dispatch",
  "delivered",
];

export function HorizontalTimeline({ job }: { job: Job }) {
  const currentIdx = VISIBLE_STAGES.indexOf(job.currentStage);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[720px]">
        {/* Connector row */}
        <div className="relative flex items-start">
          {VISIBLE_STAGES.map((key, idx) => {
            const status = stageStatus(job, key);
            const done = status === "completed";
            const active = status === "in_progress";
            const Icon = STAGE_ICONS[key];
            const lineCompleted = idx < currentIdx;

            return (
              <div key={key} className="flex-1 flex flex-col items-center relative">
                {/* Connecting line (left side, skip for first) */}
                {idx > 0 && (
                  <div
                    className="absolute top-[19px] -left-1/2 right-1/2 h-0.5 z-0"
                    style={{
                      background: lineCompleted
                        ? "var(--success)"
                        : "var(--color-border)",
                      opacity: lineCompleted ? 1 : 0.5,
                      transition: "background 0.4s",
                    }}
                  />
                )}

                {/* Icon node */}
                <div className="relative z-10">
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: "oklch(0.55 0.12 250 / 0.35)",
                        animationDuration: "1.4s",
                      }}
                    />
                  )}
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      done
                        ? "border-[var(--success)] bg-[var(--success)] text-[var(--success-foreground)] shadow-[0_0_0_4px_oklch(0.62_0.16_155_/_0.12)]"
                        : active
                          ? "border-[oklch(0.55_0.12_250)] bg-[oklch(0.42_0.1_240)] text-white shadow-[0_0_0_4px_oklch(0.55_0.12_250_/_0.15)]"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon
                        className={`h-4 w-4 ${active ? "text-white" : ""}`}
                      />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="mt-3 text-center px-1">
                  <div
                    className={`text-[10.5px] leading-tight font-medium ${
                      done
                        ? "text-[var(--success)]"
                        : active
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                    }`}
                  >
                    {STAGE_LABELS[key]}
                  </div>
                  {stageDate(job, key) && (
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {stageDate(job, key)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
