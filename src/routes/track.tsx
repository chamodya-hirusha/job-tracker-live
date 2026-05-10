import { createFileRoute, redirect, useNavigate, Outlet } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/CustomerLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/track")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("jobtrack-session-v1");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.kind !== "customer") throw redirect({ to: "/login" });
  },
  // Render Outlet so child routes (e.g. /track/$jobId) can display.
  // The TrackSearch UI is served by the /track index route below.
  component: () => <Outlet />,
});

// This component is kept for use on the /track index (no job ID entered).
export function TrackSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = q.trim().toUpperCase();
    if (id) navigate({ to: "/track/$jobId", params: { jobId: id } });
  };
  return (
    <CustomerLayout>
      <div className="max-w-xl mx-auto mt-12 text-center">
        <h1 className="text-3xl font-semibold">Track a job</h1>
        <p className="text-sm text-muted-foreground mt-2">Enter your Job ID to see real-time progress.</p>
        <form onSubmit={onSubmit} className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="JOB-10045"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-12 font-mono text-base"
              autoFocus
            />
          </div>
          <Button size="lg" type="submit">Track</Button>
        </form>
      </div>
    </CustomerLayout>
  );
}