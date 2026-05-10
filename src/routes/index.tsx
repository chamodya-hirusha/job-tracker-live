import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("jobtrack-session-v1");
        const s = raw ? JSON.parse(raw) : null;
        if (s?.kind === "admin") throw redirect({ to: "/admin" });
        if (s?.kind === "customer") throw redirect({ to: "/dashboard" });
      } catch (e) {
        if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      }
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

