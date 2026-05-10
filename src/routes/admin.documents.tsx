import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions } from "@/lib/store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, Plus, Trash2, FileText, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/documents")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><DocumentsPage /></AdminLayout>,
});

function DocumentsPage() {
  const jobs = useStore((s) => s.jobs);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === jobId);

  const [name, setName] = useState("");
  const [type, setType] = useState<"quotation" | "po" | "drawing" | "delivery_note" | "invoice">("quotation");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !name) return;
    storeActions.addDocument(jobId, {
      name,
      type,
      visible: true,
    });
    setName("");
  };

  const toggleVisible = (docId: string, current: boolean) => {
    if (!job) return;
    const docs = job.documents.map(d => d.id === docId ? { ...d, visible: !current } : d);
    storeActions.updateJob(job.id, { documents: docs });
  };

  const removeDoc = (docId: string) => {
    if (!job) return;
    const docs = job.documents.filter(d => d.id !== docId);
    storeActions.updateJob(job.id, { documents: docs });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manage documents shared with customers</p>
        <h1 className="text-3xl font-semibold mt-1">Documents</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[260px]">
            <Label className="text-xs">Select job</Label>
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
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Document Name</th>
                    <th className="text-left px-5 py-3 font-medium">Type</th>
                    <th className="text-left px-5 py-3 font-medium">Visibility</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {job.documents.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 capitalize">{d.type.replace("_", " ")}</td>
                      <td className="px-5 py-3">
                        <button 
                          onClick={() => toggleVisible(d.id, d.visible)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${d.visible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {d.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {d.visible ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeDoc(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {job.documents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground italic">
                        No documents uploaded for this job.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-sm font-semibold mb-4">Add new document</h3>
              <form onSubmit={onAdd} className="space-y-4">
                <div>
                  <Label>Document name</Label>
                  <Input 
                    className="mt-1.5" 
                    placeholder="e.g. Quotation-Revised.pdf" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Document type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quotation">Quotation</SelectItem>
                      <SelectItem value="po">Purchase Order</SelectItem>
                      <SelectItem value="drawing">Drawing</SelectItem>
                      <SelectItem value="delivery_note">Delivery Note</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4" /> Add document
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Note: In this demo, "uploading" adds a reference to the list.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
