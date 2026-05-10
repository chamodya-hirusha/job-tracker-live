import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, RefreshCw, CheckCircle2, AlertCircle, ArrowRightLeft, Link2 } from "lucide-react";
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

function SapMappingPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("2026-05-10 14:20");

  const runSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleString());
    }, 2000);
  };

  const mappings = [
    { portal: "Customer Code", sap: "KNA1-KUNNR", type: "String", status: "mapped" },
    { portal: "Customer Name", sap: "KNA1-NAME1", type: "String", status: "mapped" },
    { portal: "Sales Order No", sap: "VBAK-VBELN", type: "ID", status: "mapped" },
    { portal: "Product Code", sap: "VBAP-MATNR", type: "String", status: "mapped" },
    { portal: "Quantity Ordered", sap: "VBAP-KWMENG", type: "Number", status: "mapped" },
    { portal: "Quantity Completed", sap: "AFPO-WEMNG", type: "Number", status: "mapped" },
    { portal: "Production Status", sap: "JEST-STAT", type: "Enum", status: "pending" },
    { portal: "Delivery Number", sap: "LIKP-VBELN", type: "ID", status: "mapped" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Configure SAP ERP field synchronization</p>
          <h1 className="text-3xl font-semibold mt-1">SAP Integration</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last sync</p>
            <p className="text-xs font-medium">{lastSync}</p>
          </div>
          <Button onClick={runSync} disabled={syncing} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status Card */}
          <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">SAP S/4HANA Connection</h3>
                  <p className="text-xs text-muted-foreground">OData Service: /sap/opu/odata/sap/API_SALES_ORDER_SRV</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Connected
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Host</p>
                <p className="text-sm font-mono truncate">sap-prod.abc-manufacturing.com</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Client ID</p>
                <p className="text-sm font-mono">100 (Production)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auth Method</p>
                <p className="text-sm">OAuth 2.0 / X.509</p>
              </div>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Field Mapping (Phase 3)</h3>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-accent hover:text-accent">
                <Link2 className="h-3.5 w-3.5" /> Edit Mappings
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Portal Field</th>
                  <th className="text-center px-2 py-3"><ArrowRightLeft className="h-3 w-3 mx-auto" /></th>
                  <th className="text-left px-5 py-3 font-medium">SAP Data Element</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mappings.map((m) => (
                  <tr key={m.portal} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{m.portal}</td>
                    <td className="text-center text-muted-foreground/30 px-2">
                      <div className="h-px w-4 bg-current mx-auto" />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{m.sap}</td>
                    <td className="px-5 py-3">
                      {m.status === "mapped" ? (
                        <div className="flex items-center gap-1.5 text-success font-medium text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Mapped
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-warning font-medium text-[11px]">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-semibold mb-4">Sync Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Real-time Sync</Label>
                  <p className="text-[10px] text-muted-foreground">Update portal instantly on SAP change</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-update Stages</Label>
                  <p className="text-[10px] text-muted-foreground">Move stages based on SAP status</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Log Technical Errors</Label>
                  <p className="text-[10px] text-muted-foreground">Capture OData 400/500 errors</p>
                </div>
                <Switch />
              </div>
              
              <div className="pt-4 border-t border-border">
                <Label className="text-xs">Batch Update Interval</Label>
                <Select defaultValue="15">
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="60">Every 1 hour</SelectItem>
                    <SelectItem value="daily">Daily at midnight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <h3 className="text-sm font-semibold relative z-10">Integration Tip</h3>
            <p className="text-xs text-muted-foreground mt-2 relative z-10 leading-relaxed">
              For the demo (Phase 1), manual data overrides SAP sync. Once the OData API is live (Phase 3), the portal will automatically pull the source of truth from your SAP instance.
            </p>
            <Button variant="link" className="px-0 h-auto text-xs mt-3 relative z-10 text-primary font-semibold">
              Read Integration Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
