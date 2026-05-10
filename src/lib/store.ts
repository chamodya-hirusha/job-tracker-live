import { useSyncExternalStore } from "react";

export type StageKey =
  | "quotation"
  | "order_confirmed"
  | "material_procurement"
  | "manufacturing"
  | "quality_check"
  | "ready_for_dispatch"
  | "delivered"
  | "completed";

export const STAGE_ORDER: StageKey[] = [
  "quotation",
  "order_confirmed",
  "material_procurement",
  "manufacturing",
  "quality_check",
  "ready_for_dispatch",
  "delivered",
  "completed",
];

export const STAGE_LABELS: Record<StageKey, string> = {
  quotation: "Quotation",
  order_confirmed: "Order Confirmed",
  material_procurement: "Material Procurement",
  manufacturing: "Manufacturing",
  quality_check: "Quality Check",
  ready_for_dispatch: "Ready for Dispatch",
  delivered: "Delivered",
  completed: "Completed",
};

export type StageStatus = "pending" | "in_progress" | "completed";

export interface StageEntry {
  key: StageKey;
  status: StageStatus;
  date?: string;
  message?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  active: boolean;
}

export interface JobDocument {
  id: string;
  name: string;
  type: "quotation" | "po" | "drawing" | "delivery_note" | "invoice";
  visible: boolean;
}

export interface Job {
  id: string;
  customerId: string;
  customerPO: string;
  salesOrder: string;
  quotationNo: string;
  productCode: string;
  productName: string;
  description: string;
  material: string;
  finish: string;
  drawingNo: string;
  revision: string;
  quantity: number;
  completedQty: number;
  orderDate: string;
  requiredDate: string;
  expectedDate: string;
  currentStage: StageKey;
  customerMessage: string;
  stages: StageEntry[];
  documents: JobDocument[];
}

interface StoreState {
  customers: Customer[];
  jobs: Job[];
}

const seedStages = (current: StageKey): StageEntry[] => {
  const idx = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER.map((key, i) => ({
    key,
    status: i < idx ? "completed" : i === idx ? "in_progress" : "pending",
    date: i <= idx ? new Date(Date.now() - (idx - i) * 86400000 * 3).toISOString().slice(0, 10) : undefined,
  }));
};

const seed: StoreState = {
  customers: [
    {
      id: "c1",
      code: "CUST-001",
      name: "ABC Trading Pvt Ltd",
      contact: "Rahul Mehta",
      email: "customer@abc.com",
      phone: "+91 98200 12345",
      address: "Plot 14, MIDC Industrial Area, Pune 411019",
      password: "123456",
      active: true,
    },
    {
      id: "c2",
      code: "CUST-002",
      name: "Precision Auto Components",
      contact: "Anita Sharma",
      email: "ops@precision-auto.com",
      phone: "+91 99100 88224",
      address: "Sector 8, Gurugram 122001",
      password: "demo123",
      active: true,
    },
  ],
  jobs: [
    {
      id: "JOB-10045",
      customerId: "c1",
      customerPO: "PO-7788",
      salesOrder: "SO-50001234",
      quotationNo: "QT-2026-0091",
      productCode: "MAT-9001",
      productName: "Custom Steel Gear",
      description: "CNC machined steel gear, 24-tooth helical, hardened",
      material: "Mild Steel EN8",
      finish: "Zinc Plated",
      drawingNo: "DRW-2026-0045",
      revision: "Rev 02",
      quantity: 250,
      completedQty: 120,
      orderDate: "2026-05-10",
      requiredDate: "2026-05-28",
      expectedDate: "2026-05-25",
      currentStage: "manufacturing",
      customerMessage:
        "Production is on track. 120 of 250 pieces machined. QC begins next week.",
      stages: seedStages("manufacturing"),
      documents: [
        { id: "d1", name: "Quotation QT-2026-0091.pdf", type: "quotation", visible: true },
        { id: "d2", name: "Purchase Order PO-7788.pdf", type: "po", visible: true },
        { id: "d3", name: "Drawing DRW-2026-0045 Rev02.pdf", type: "drawing", visible: true },
      ],
    },
    {
      id: "JOB-10046",
      customerId: "c1",
      customerPO: "PO-7790",
      salesOrder: "SO-50001244",
      quotationNo: "QT-2026-0093",
      productCode: "MAT-9012",
      productName: "Hydraulic Manifold Block",
      description: "Aluminium 6061 manifold, 6-port",
      material: "Aluminium 6061-T6",
      finish: "Hard Anodised",
      drawingNo: "DRW-2026-0061",
      revision: "Rev 01",
      quantity: 80,
      completedQty: 80,
      orderDate: "2026-04-22",
      requiredDate: "2026-05-18",
      expectedDate: "2026-05-16",
      currentStage: "quality_check",
      customerMessage: "All pieces machined. Final QC inspection in progress.",
      stages: seedStages("quality_check"),
      documents: [
        { id: "d4", name: "Quotation QT-2026-0093.pdf", type: "quotation", visible: true },
        { id: "d5", name: "Drawing DRW-2026-0061 Rev01.pdf", type: "drawing", visible: true },
      ],
    },
    {
      id: "JOB-10047",
      customerId: "c1",
      customerPO: "PO-7791",
      salesOrder: "SO-50001250",
      quotationNo: "QT-2026-0095",
      productCode: "MAT-9020",
      productName: "Stainless Steel Flange",
      description: "SS316 weld neck flange, 4 inch, Class 150",
      material: "Stainless Steel 316",
      finish: "Polished",
      drawingNo: "DRW-2026-0070",
      revision: "Rev 01",
      quantity: 40,
      completedQty: 40,
      orderDate: "2026-04-05",
      requiredDate: "2026-05-02",
      expectedDate: "2026-05-01",
      currentStage: "delivered",
      customerMessage: "Delivered to your warehouse. Invoice attached.",
      stages: seedStages("delivered"),
      documents: [
        { id: "d6", name: "Delivery Note DN-2026-0033.pdf", type: "delivery_note", visible: true },
        { id: "d7", name: "Invoice INV-2026-0118.pdf", type: "invoice", visible: true },
      ],
    },
    {
      id: "JOB-10050",
      customerId: "c2",
      customerPO: "PA-3321",
      salesOrder: "SO-50001260",
      quotationNo: "QT-2026-0098",
      productCode: "MAT-9101",
      productName: "Brake Caliper Bracket",
      description: "Forged steel caliper bracket, machined",
      material: "Forged Steel",
      finish: "Black Phosphate",
      drawingNo: "DRW-2026-0081",
      revision: "Rev 03",
      quantity: 500,
      completedQty: 0,
      orderDate: "2026-05-08",
      requiredDate: "2026-06-15",
      expectedDate: "2026-06-12",
      currentStage: "material_procurement",
      customerMessage: "Raw forgings ordered. Expected in next week.",
      stages: seedStages("material_procurement"),
      documents: [
        { id: "d8", name: "Quotation QT-2026-0098.pdf", type: "quotation", visible: true },
      ],
    },
  ],
};

const STORAGE_KEY = "jobtrack-store-v1";

const load = (): StoreState => {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreState;
  } catch {}
  return seed;
};

let state: StoreState = load();
const listeners = new Set<() => void>();

const persist = () => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useStore = <T,>(selector: (s: StoreState) => T): T =>
  useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(seed),
  );

export const storeActions = {
  addCustomer(c: Omit<Customer, "id">) {
    state = { ...state, customers: [...state.customers, { ...c, id: `c${Date.now()}` }] };
    persist();
  },
  updateCustomer(id: string, patch: Partial<Customer>) {
    state = {
      ...state,
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    };
    persist();
  },
  addJob(j: Omit<Job, "stages" | "documents"> & { stages?: StageEntry[]; documents?: JobDocument[] }) {
    const job: Job = {
      ...j,
      stages: j.stages ?? seedStages(j.currentStage),
      documents: j.documents ?? [],
    };
    state = { ...state, jobs: [...state.jobs, job] };
    persist();
  },
  updateJob(id: string, patch: Partial<Job>) {
    state = {
      ...state,
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    };
    persist();
  },
  setStage(jobId: string, stageKey: StageKey, status: StageStatus, message?: string) {
    state = {
      ...state,
      jobs: state.jobs.map((j) => {
        if (j.id !== jobId) return j;
        const stages = j.stages.map((s) =>
          s.key === stageKey
            ? { ...s, status, date: new Date().toISOString().slice(0, 10), message }
            : s,
        );
        // recompute current stage = first non-completed
        const current =
          (stages.find((s) => s.status === "in_progress")?.key ??
            stages.find((s) => s.status === "pending")?.key ??
            "completed") as StageKey;
        return { ...j, stages, currentStage: current, customerMessage: message ?? j.customerMessage };
      }),
    };
    persist();
  },
  addDocument(jobId: string, doc: Omit<JobDocument, "id">) {
    state = {
      ...state,
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, documents: [...j.documents, { ...doc, id: `d${Date.now()}` }] } : j,
      ),
    };
    persist();
  },
  reset() {
    state = seed;
    persist();
  },
};

export const findCustomerByEmail = (email: string) =>
  state.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());

export const getState = () => state;