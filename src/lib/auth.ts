import { useSyncExternalStore } from "react";
import { findCustomerByEmail } from "./store";

export type Session =
  | { kind: "customer"; customerId: string; name: string }
  | { kind: "admin"; name: string }
  | null;

const KEY = "jobtrack-session-v1";

const load = (): Session => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

let session: Session = load();
const listeners = new Set<() => void>();

const set = (s: Session) => {
  session = s;
  if (typeof window !== "undefined") {
    if (s) window.localStorage.setItem(KEY, JSON.stringify(s));
    else window.localStorage.removeItem(KEY);
  }
  listeners.forEach((l) => l());
};

export const useSession = (): Session =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => session,
    () => null,
  );

export const auth = {
  loginCustomer(email: string, password: string): Session {
    const c = findCustomerByEmail(email);
    if (!c || c.password !== password || !c.active) return null;
    const s: Session = { kind: "customer", customerId: c.id, name: c.name };
    set(s);
    return s;
  },
  loginAdmin(username: string, password: string): Session {
    if (username === "admin" && password === "admin") {
      const s: Session = { kind: "admin", name: "Operations Admin" };
      set(s);
      return s;
    }
    return null;
  },
  logout() {
    set(null);
  },
};