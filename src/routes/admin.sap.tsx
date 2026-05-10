import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database, RefreshCw, CheckCircle2, AlertCircle, ArrowRightLeft,
  Link2, Activity, ShieldCheck, Clock, Zap, BookOpen,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/sap")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><SapMappingPage /></AdminLayout>,
});

const MAPPINGS = [
  { portal: "Customer Code",       sap: "KNA1-KUNNR",   type: "String", module: "FI/SD", status: "mapped"   },
  { portal: "Customer Name",       sap: "KNA1-NAME1",   type: "String", module: "FI/SD", status: "mapped"   },
  { portal: "Sales Order No.",     sap: "VBAK-VBELN",   type: "ID",     module: "SD",    status: "mapped"   },
  { portal: "Product Code",        sap: "VBAP-MATNR",   type: "String", module: "SD/MM", status: "mapped"   },
  { portal: "Quantity Ordered",    sap: "VBAP-KWMENG",  type: "Number", module: "SD",    status: "mapped"   },
  { portal: "Quantity Completed",  sap: "AFPO-WEMNG",   type: "Number", module: "PP",    status: "mapped"   },
  { portal: "Production Status",   sap: "JEST-STAT",    type: "Enum",   module: "PP",    status: "pending"  },
  { portal: "Delivery Number",     sap: "LIKP-VBELN",   type: "ID",     module: "SD/WM", status: "mapped"   },
  { portal: "Invoice Reference",   sap: "VBRK-VBELN",   type: "ID",     module: "FI",    status: "mapped"   },
  { portal: "Drawing Number",      sap: "DRAW-DOKNR",   type: "String", module: "DMS",   status: "pending"  },
];

const SYNC_LOG = [
  { time: "14:20:11", event: "Full sync completed",       status: "success", records: 42  },
  { time: "14:05:03", event: "Sales order VBAK updated",  status: "success", records: 8   },
  { time: "13:48:31", event: "PP status polling",         status: "warning", records: 0   },
  { time: "13:30:00", event: "Scheduled batch sync",      status: "success", records: 38  },
  { time: "12:15:44", event: "Document metadata pulled",  status: "success", records: 14  },
];

function SapMappingPage() {
  const [syncing, setSyncing]   = useState(false);
  const [lastSync, setLastSync] = useState("2026-05-10 14:20:11");
  const [host, setHost]         = useState("sap-prod.abc-manufacturing.com");
  const [interval, setInterval] = useState("15");

  const runSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleString("sv").replace("T", " "));
    }, 2200);
  };

  const mapped  = MAPPINGS.filter((m) => m.status === "mapped").length;
  const pending = MAPPINGS.length - mapped;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">ERP Integration</p>
          <h1 className="text-3xl font-bold mt-1">SAP Integration</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Sync</p>
            <p className="text-xs font-mono font-medium">{lastSync}</p>
          </div>
          <Button onClick={runSync} disabled={syncing} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync Now"}
          </Button>
        </div>
      </div>

      {/* Status KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Connection",   value: "Online",        sub: "SAP S/4HANA 2023",    Icon: Activity,    cls: "text-emerald-600 bg-emerald-50" },
          { label: "Fields Mapped",value: `${mapped}/${MAPPINGS.length}`, sub: `${pending} pending`, Icon: ArrowRightLeft, cls: "text-blue-600 bg-blue-50" },
          { label: "Sync Mode",    value: "Real-time",     sub: "OData push",          Icon: Zap,         cls: "text-amber-600 bg-amber-50" },
          { label: "Auth",         value: "OAuth 2.0",     sub: "X.509 cert active",   Icon: ShieldCheck, cls: "text-violet-600 bg-violet-50" },
        ].map(({ label, value, sub, Icon, cls }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls}`}><Icon className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{label} · {sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Connection + Mapping table — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection card */}
          <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">SAP S/4HANA Connection</h3>
                  <p className="text-xs text-muted-foreground font-mono">OData: /sap/opu/odata/sap/API_SALES_ORDER_SRV</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-border pt-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Host</p>
                <Input
                  className="mt-1 h-8 text-xs font-mono"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Client</p>
                <p className="text-sm font-mono mt-2">100 (Production)</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">System ID</p>
                <p className="text-sm font-mono mt-2">PRD / 00</p>
              </div>
            </div>
          </div>

          {/* Field mapping table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Field Mapping</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{mapped} mapped · {pending} pending configuration</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Edit Mappings
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Portal Field</th>
                  <th className="text-center px-2 py-3 w-8"><ArrowRightLeft className="h-3 w-3 mx-auto" /></th>
                  <th className="text-left px-5 py-3 font-medium">SAP Element</th>
                  <th className="text-left px-4 py-3 font-medium">Module</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MAPPINGS.map((m) => (
                  <tr key={m.portal} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-sm">{m.portal}</td>
                    <td className="text-center text-muted-foreground/20 px-2">
                      <div className="h-px w-4 bg-current mx-auto" />
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{m.sap}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-muted border border-border text-[10px] font-semibold px-2 py-0.5 text-muted-foreground">{m.module}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {m.status === "mapped" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mapped
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" /> Pending
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sync log */}
          <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Recent Sync Log</h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Time</th>
                  <th className="text-left px-5 py-2 font-medium">Event</th>
                  <th className="text-left px-4 py-2 font-medium">Records</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SYNC_LOG.map((l, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-5 py-2.5 font-mono text-muted-foreground">{l.time}</td>
                    <td className="px-5 py-2.5">{l.event}</td>
                    <td className="px-4 py-2.5 font-mono">{l.records}</td>
                    <td className="px-4 py-2.5">
                      {l.status === "success" ? (
                        <span className="text-emerald-600 font-semibold">✓ OK</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">⚠ Warn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Config panel — 1 col */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold mb-4">Sync Configuration</h3>
            <div className="space-y-5">
              {[
                { label: "Real-time Sync",    sub: "Push updates instantly on SAP change", defaultOn: true },
                { label: "Auto-update Stages",sub: "Move job stages based on SAP status",  defaultOn: true },
                { label: "Log Technical Errors",sub: "Capture OData 400/500 responses",    defaultOn: false },
                { label: "Customer Notifications",sub: "Notify on stage completion",        defaultOn: false },
              ].map(({ label, sub, defaultOn }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                  <Switch defaultChecked={defaultOn} />
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Batch Interval</Label>
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger className="mt-2 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="60">Every 1 hour</SelectItem>
                    <SelectItem value="daily">Daily at midnight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gap-2 mt-1">
                <RefreshCw className="h-4 w-4" /> Apply Settings
              </Button>
            </div>
          </div>

          {/* Info tip */}
          <div className="rounded-xl border border-primary/20 bg-primary/4 p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/8 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Integration Note</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In Phase 1, manual data overrides SAP sync. Once the OData API goes live in Phase 3, the portal automatically pulls source-of-truth data from your SAP instance.
              </p>
              <Button variant="link" className="px-0 h-auto text-xs mt-3 text-primary font-semibold">
                Read Integration Docs →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
