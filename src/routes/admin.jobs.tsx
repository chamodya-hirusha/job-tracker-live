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
import { Plus } from "lucide-react";
import { useState } from "react";
import { StageBadge } from "@/components/StageBadge";

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
  id: "",
  customerId: "",
  customerPO: "",
  salesOrder: "",
  quotationNo: "",
  productCode: "",
  productName: "",
  description: "",
  material: "",
  finish: "",
  drawingNo: "",
  revision: "Rev 01",
  quantity: 0,
  completedQty: 0,
  orderDate: new Date().toISOString().slice(0, 10),
  requiredDate: "",
  expectedDate: "",
  currentStage: "quotation" as StageKey,
  customerMessage: "",
};

function JobsPage() {
  const { jobs, customers } = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    storeActions.addJob({ ...f, quantity: Number(f.quantity), completedQty: Number(f.completedQty) });
    setF(empty);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">All manufacturing jobs</p>
          <h1 className="text-3xl font-semibold mt-1">Jobs</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create new job</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <Field label="Job ID" v={f.id} on={(v) => setF({ ...f, id: v })} mono />
              <div>
                <Label>Customer</Label>
                <Select value={f.customerId} onValueChange={(v) => setF({ ...f, customerId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Field label="Customer PO" v={f.customerPO} on={(v) => setF({ ...f, customerPO: v })} />
              <Field label="Sales Order" v={f.salesOrder} on={(v) => setF({ ...f, salesOrder: v })} />
              <Field label="Quotation No." v={f.quotationNo} on={(v) => setF({ ...f, quotationNo: v })} />
              <Field label="Product Code" v={f.productCode} on={(v) => setF({ ...f, productCode: v })} />
              <Field label="Product Name" v={f.productName} on={(v) => setF({ ...f, productName: v })} />
              <Field label="Material" v={f.material} on={(v) => setF({ ...f, material: v })} />
              <Field label="Finish" v={f.finish} on={(v) => setF({ ...f, finish: v })} />
              <Field label="Drawing No." v={f.drawingNo} on={(v) => setF({ ...f, drawingNo: v })} />
              <Field label="Revision" v={f.revision} on={(v) => setF({ ...f, revision: v })} />
              <Field label="Quantity" v={String(f.quantity)} on={(v) => setF({ ...f, quantity: Number(v) })} type="number" />
              <Field label="Completed Qty" v={String(f.completedQty)} on={(v) => setF({ ...f, completedQty: Number(v) })} type="number" />
              <Field label="Order Date" v={f.orderDate} on={(v) => setF({ ...f, orderDate: v })} type="date" />
              <Field label="Required Delivery" v={f.requiredDate} on={(v) => setF({ ...f, requiredDate: v })} type="date" />
              <Field label="Expected Completion" v={f.expectedDate} on={(v) => setF({ ...f, expectedDate: v })} type="date" />
              <div>
                <Label>Current Stage</Label>
                <Select value={f.currentStage} onValueChange={(v) => setF({ ...f, currentStage: v as StageKey })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGE_ORDER.map((k) => <SelectItem key={k} value={k}>{STAGE_LABELS[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Customer message</Label>
                <Textarea className="mt-1.5" value={f.customerMessage} onChange={(e) => setF({ ...f, customerMessage: e.target.value })} />
              </div>
              <DialogFooter className="col-span-2"><Button type="submit">Create job</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Job</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Qty</th>
              <th className="text-left px-5 py-3 font-medium">Stage</th>
              <th className="text-left px-5 py-3 font-medium">Required</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((j) => {
              const c = customers.find((c) => c.id === j.customerId);
              return (
                <tr key={j.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="font-mono font-medium">{j.id}</div>
                    <div className="text-xs text-muted-foreground">{j.productName}</div>
                  </td>
                  <td className="px-5 py-3">{c?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">{j.completedQty}/{j.quantity}</td>
                  <td className="px-5 py-3"><StageBadge stage={j.currentStage} status="in_progress" /></td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{j.requiredDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, v, on, type = "text", mono }: { label: string; v: string; on: (v: string) => void; type?: string; mono?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} className={`mt-1.5 ${mono ? "font-mono" : ""}`} required />
    </div>
  );
}