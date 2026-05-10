import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", contact: "", email: "", phone: "", address: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    storeActions.addCustomer({ ...form, active: true });
    setForm({ code: "", name: "", contact: "", email: "", phone: "", address: "", password: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage portal accounts</p>
          <h1 className="text-3xl font-semibold mt-1">Customers</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New customer</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid grid-cols-2 gap-3">
              {(["code","name","contact","email","phone","address","password"] as const).map((k) => (
                <div key={k} className={k === "address" ? "col-span-2" : ""}>
                  <Label className="capitalize">{k}</Label>
                  <Input className="mt-1.5" required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
              <DialogFooter className="col-span-2">
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Code</th>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Contact</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-mono">{c.code}</td>
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3">{c.contact}<div className="text-xs text-muted-foreground">{c.phone}</div></td>
                <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.active ? "bg-success" : "bg-muted-foreground"}`} />
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}