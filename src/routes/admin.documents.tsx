import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useStore, storeActions } from "@/lib/store";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileDown, Plus, Trash2, FileText, Eye, EyeOff,
  FileBadge, FileSpreadsheet, Package, Receipt,
} from "lucide-react";

export const Route = createFileRoute("/admin/documents")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "admin") throw redirect({ to: "/admin/login" });
  },
  component: () => <AdminLayout><DocumentsPage /></AdminLayout>,
});

const DOC_TYPES = [
  { value: "quotation",     label: "Quotation",      Icon: FileText,        color: "text-blue-600 bg-blue-50" },
  { value: "po",            label: "Purchase Order", Icon: FileBadge,       color: "text-sky-600 bg-sky-50" },
  { value: "drawing",       label: "Drawing",        Icon: FileSpreadsheet, color: "text-violet-600 bg-violet-50" },
  { value: "delivery_note", label: "Delivery Note",  Icon: Package,         color: "text-emerald-600 bg-emerald-50" },
  { value: "invoice",       label: "Invoice",        Icon: Receipt,         color: "text-amber-600 bg-amber-50" },
] as const;

type DocTypeValue = typeof DOC_TYPES[number]["value"];

function docMeta(type: string) {
  return DOC_TYPES.find((d) => d.value === type) ?? DOC_TYPES[0];
}

function DocumentsPage() {
  const jobs  = useStore((s) => s.jobs);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const job = jobs.find((j) => j.id === jobId);

  const [name, setName] = useState("");
  const [type, setType] = useState<DocTypeValue>("quotation");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !name) return;
    storeActions.addDocument(jobId, { name, type, visible: true });
    setName("");
  };

  const toggleVisible = (docId: string, current: boolean) => {
    if (!job) return;
    storeActions.updateJob(job.id, {
      documents: job.documents.map((d) => d.id === docId ? { ...d, visible: !current } : d),
    });
  };

  const removeDoc = (docId: string) => {
    if (!job) return;
    storeActions.updateJob(job.id, { documents: job.documents.filter((d) => d.id !== docId) });
  };

  const visibleCount = job?.documents.filter((d) => d.visible).length ?? 0;
  const hiddenCount  = (job?.documents.length ?? 0) - visibleCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Admin Panel</p>
        <h1 className="text-3xl font-bold mt-1">Documents</h1>
      </div>

      {/* Job selector */}
      <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Job</Label>
        <div className="flex flex-wrap gap-3 mt-2">
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  <span className="font-mono">{j.id}</span> — {j.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {job && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 font-medium">
                <Eye className="h-3 w-3" /> {visibleCount} visible
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted border border-border px-2.5 py-1 font-medium">
                <EyeOff className="h-3 w-3" /> {hiddenCount} hidden
              </span>
            </div>
          )}
        </div>
      </div>

      {job && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document list — 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Attached Documents</h3>
                <span className="text-xs text-muted-foreground">{job.documents.length} total</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Document</th>
                    <th className="text-left px-5 py-3 font-medium">Type</th>
                    <th className="text-left px-5 py-3 font-medium">Visibility</th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {job.documents.map((d) => {
                    const meta = docMeta(d.type);
                    const DocIcon = meta.Icon;
                    return (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${meta.color}`}>
                              <DocIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-sm leading-snug">{d.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono uppercase">{d.type.replace("_", " ")}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => toggleVisible(d.id, d.visible)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                              d.visible
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                            }`}
                          >
                            {d.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {d.visible ? "Visible to customer" : "Hidden"}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeDoc(d.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {job.documents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-14 text-center">
                        <FileDown className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                        <p className="text-sm text-muted-foreground">No documents for this job yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add document form — 1 col */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Add Document</h3>
              </div>
              <form onSubmit={onAdd} className="space-y-4">
                <div>
                  <Label className="text-xs">Document Name</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. Quotation-Revised.pdf"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Document Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Add Document
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  In this demo, adding a document creates a reference entry visible to the customer.
                </p>
              </form>
            </div>

            {/* Type legend */}
            <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Document Types</h4>
              <div className="space-y-2">
                {DOC_TYPES.map(({ label, Icon, color }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <div className={`h-6 w-6 rounded flex items-center justify-center ${color}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
