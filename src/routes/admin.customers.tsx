import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Phone, Mail, MapPin, Building2, Hash, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/customers")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><CustomersPage /></AdminLayout>,
});

function CustomersPage() {
  const customers = useStore((s) => s.customers);
  const jobs      = useStore((s) => s.jobs);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", contact: "", email: "", phone: "", address: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    storeActions.addCustomer({ ...form, active: true });
    setForm({ code: "", name: "", contact: "", email: "", phone: "", address: "", password: "" });
    setOpen(false);
  };

  const activeCount   = customers.filter((c) => c.active).length;
  const inactiveCount = customers.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Admin Panel</p>
          <h1 className="text-3xl font-bold mt-1">Customers</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Customer Account</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3 mt-2">
              {(["code","name","contact","email","phone","address","password"] as const).map((k) => (
                <div key={k} className={k === "address" || k === "email" ? "col-span-2" : ""}>
                  <Label className="capitalize text-xs">{k}</Label>
                  <Input
                    className="mt-1.5"
                    required
                    type={k === "password" ? "password" : k === "email" ? "email" : "text"}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              ))}
              <DialogFooter className="col-span-2 pt-1">
                <Button type="submit" className="w-full">Create Customer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: customers.length, Icon: Users, cls: "bg-blue-50 text-blue-600" },
          { label: "Active", value: activeCount,     Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
          { label: "Inactive", value: inactiveCount, Icon: XCircle,      cls: "bg-muted text-muted-foreground" },
        ].map(({ label, value, Icon, cls }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls}`}><Icon className="h-4 w-4" /></div>
            <div>
              <div className="text-xl font-bold tabular-nums">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer cards grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {customers.map((c) => {
          const jobCount = jobs.filter((j) => j.customerId === c.id).length;
          return (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all hover:border-primary/20 group"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-bold text-sm">
                  {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${c.active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-muted text-muted-foreground border border-border"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${c.active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
              {/* Name & code */}
              <div className="font-semibold text-sm leading-snug">{c.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{c.code}</div>
              {/* Details */}
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />{c.contact}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" />{c.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="leading-tight">{c.address}</span>
                </div>
              </div>
              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span className="font-semibold text-foreground">{jobCount}</span> job{jobCount !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => storeActions.updateCustomer(c.id, { active: !c.active })}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                >
                  {c.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
        {customers.length === 0 && (
          <div className="col-span-3 py-16 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No customers yet. Click "Add Customer" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}