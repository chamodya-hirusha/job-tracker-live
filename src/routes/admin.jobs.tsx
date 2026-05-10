import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions, STAGE_ORDER, STAGE_LABELS } from "@/lib/store";
import type { StageKey } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { StageBadge } from "@/components/StageBadge";
import { Plus, Briefcase, Search } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/admin/jobs")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><JobsPage /></AdminLayout>,
});

const empty = {
  id: "", customerId: "", customerPO: "", salesOrder: "", quotationNo: "",
  productCode: "", productName: "", description: "", material: "", finish: "",
  drawingNo: "", revision: "Rev 01", quantity: 0, completedQty: 0,
  orderDate: new Date().toISOString().slice(0, 10), requiredDate: "", expectedDate: "",
  currentStage: "quotation" as StageKey, customerMessage: "",
};

function JobsPage() {
  const { jobs, customers } = useStore((s) => s);
  const [open, setOpen]     = useState(false);
  const [f, setF]           = useState(empty);
  const [q, setQ]           = useState("");
  const [filterStage, setFilterStage] = useState("all");

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchQ = !q || j.id.toLowerCase().includes(q.toLowerCase()) || j.productName.toLowerCase().includes(q.toLowerCase());
      const matchStage = filterStage === "all" || j.currentStage === filterStage;
      return matchQ && matchStage;
    });
  }, [jobs, q, filterStage]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    storeActions.addJob({ ...f, quantity: Number(f.quantity), completedQty: Number(f.completedQty) });
    setF(empty);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Manufacturing</p>
          <h1 className="text-3xl font-bold mt-1">Jobs</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Job</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1 mt-2">
              <Field label="Job ID"            v={f.id}            on={(v) => setF({ ...f, id: v })} mono />
              <div>
                <Label className="text-xs">Customer</Label>
                <Select value={f.customerId} onValueChange={(v) => setF({ ...f, customerId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Field label="Customer PO"       v={f.customerPO}    on={(v) => setF({ ...f, customerPO: v })} />
              <Field label="Sales Order"       v={f.salesOrder}    on={(v) => setF({ ...f, salesOrder: v })} />
              <Field label="Quotation No."     v={f.quotationNo}   on={(v) => setF({ ...f, quotationNo: v })} />
              <Field label="Product Code"      v={f.productCode}   on={(v) => setF({ ...f, productCode: v })} />
              <Field label="Product Name"      v={f.productName}   on={(v) => setF({ ...f, productName: v })} />
              <Field label="Material"          v={f.material}      on={(v) => setF({ ...f, material: v })} />
              <Field label="Finish"            v={f.finish}        on={(v) => setF({ ...f, finish: v })} />
              <Field label="Drawing No."       v={f.drawingNo}     on={(v) => setF({ ...f, drawingNo: v })} />
              <Field label="Revision"          v={f.revision}      on={(v) => setF({ ...f, revision: v })} />
              <Field label="Quantity"          v={String(f.quantity)}      on={(v) => setF({ ...f, quantity: Number(v) })}      type="number" />
              <Field label="Completed Qty"     v={String(f.completedQty)} on={(v) => setF({ ...f, completedQty: Number(v) })} type="number" />
              <Field label="Order Date"        v={f.orderDate}     on={(v) => setF({ ...f, orderDate: v })}     type="date" />
              <Field label="Required Delivery" v={f.requiredDate}  on={(v) => setF({ ...f, requiredDate: v })}  type="date" />
              <Field label="Expected Date"     v={f.expectedDate}  on={(v) => setF({ ...f, expectedDate: v })}  type="date" />
              <div>
                <Label className="text-xs">Current Stage</Label>
                <Select value={f.currentStage} onValueChange={(v) => setF({ ...f, currentStage: v as StageKey })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGE_ORDER.map((k) => <SelectItem key={k} value={k}>{STAGE_LABELS[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Customer Message</Label>
                <Textarea className="mt-1.5" rows={2} value={f.customerMessage} onChange={(e) => setF({ ...f, customerMessage: e.target.value })} />
              </div>
              <DialogFooter className="col-span-2 pt-1">
                <Button type="submit" className="w-full">Create Job</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Job ID or product…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGE_ORDER.map((k) => <SelectItem key={k} value={k}>{STAGE_LABELS[k]}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
          <Briefcase className="h-3.5 w-3.5" />
          {filtered.length} of {jobs.length}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Job / Product</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Qty Progress</th>
              <th className="text-left px-5 py-3 font-medium">Stage</th>
              <th className="text-left px-5 py-3 font-medium">Order Date</th>
              <th className="text-left px-5 py-3 font-medium">Required</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((j) => {
              const c   = customers.find((c) => c.id === j.customerId);
              const pct = j.quantity > 0 ? Math.round((j.completedQty / j.quantity) * 100) : 0;
              const isDelayed = new Date(j.expectedDate) > new Date(j.requiredDate);
              return (
                <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold">{j.id}</span>
                      {isDelayed && (
                        <span className="rounded-full bg-red-50 border border-red-100 text-red-500 text-[9px] px-1.5 py-0.5 font-semibold">DELAYED</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{j.productName}</div>
                  </td>
                  <td className="px-5 py-3 text-sm">{c?.name ?? "—"}</td>
                  <td className="px-5 py-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[oklch(0.62_0.16_155)] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">{j.completedQty}/{j.quantity}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{pct}% complete</div>
                  </td>
                  <td className="px-5 py-3"><StageBadge stage={j.currentStage} status="in_progress" /></td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{j.orderDate}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{j.requiredDate}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No jobs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, v, on, type = "text", mono }: { label: string; v: string; on: (v: string) => void; type?: string; mono?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} className={`mt-1.5 ${mono ? "font-mono" : ""}`} required />
    </div>
  );
}