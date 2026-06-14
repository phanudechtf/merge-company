// System overview map — drives the interactive flowchart at /overview.
// Grid-based layout (col/row) so everything snaps to a tidy grid.
// Entity nodes carry an href (= "/" + id) and a status; process/decision/terminal
// nodes describe the real workflow inside each domain.

export type NodeKind = "entity" | "process" | "decision" | "terminal";
export type ModStatus = "rich" | "table" | "workflow";

export interface RawNode {
  id: string;
  c: number; // grid column
  r: number; // grid row
  kind: NodeKind;
  label: string;
  domain: string;
  href?: string;
  status?: ModStatus;
}

export interface RawEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DomainMeta {
  id: string;
  label: string;
  color: string;
}

export const CELL_X = 200;
export const CELL_Y = 96;

export const domainMeta: DomainMeta[] = [
  { id: "wo", label: "การ์ดงาน (Work Order Flow)", color: "#6366f1" },
  { id: "people", label: "บุคลากร (Core / Master Data)", color: "#d4a017" },
  { id: "recruit", label: "สรรหา → จ้าง", color: "#f97316" },
  { id: "time", label: "เวลา & การลา", color: "#0ea5e9" },
  { id: "finance", label: "การเงิน / Payroll", color: "#f43f5e" },
  { id: "facility", label: "การประชุม", color: "#8b5cf6" },
  { id: "develop", label: "พัฒนาบุคลากร", color: "#14b8a6" },
  { id: "resource", label: "ทรัพยากร HR", color: "#06b6d4" },
  { id: "comm", label: "สื่อสาร & รายงาน", color: "#ec4899" },
  { id: "system", label: "ระบบ", color: "#64748b" },
  { id: "retail", label: "Retail & Operations", color: "#10b981" },
];

export const rawNodes: RawNode[] = [
  // ── Work Order flow ──────────────────────────────────────────────
  { id: "work-orders", c: 2, r: 0, kind: "entity", label: "การ์ดงาน", domain: "wo", href: "/work-orders", status: "rich" },
  { id: "wo-pending", c: 3, r: 0, kind: "process", label: "รออนุมัติ", domain: "wo" },
  { id: "wo-dec", c: 4, r: 0, kind: "decision", label: "อนุมัติ?", domain: "wo" },
  { id: "wo-progress", c: 5, r: 0, kind: "process", label: "กำลังทำ", domain: "wo" },
  { id: "wo-done", c: 6, r: 0, kind: "terminal", label: "เสร็จ", domain: "wo" },
  { id: "wo-reject", c: 4, r: 1, kind: "terminal", label: "ปฏิเสธ", domain: "wo" },
  { id: "dashboard", c: 7, r: 0, kind: "entity", label: "Dashboard", domain: "wo", href: "/dashboard", status: "rich" },

  // ── People / Core master data ────────────────────────────────────
  { id: "departments", c: 1, r: 3, kind: "entity", label: "แผนก", domain: "people", href: "/departments", status: "table" },
  { id: "branches", c: 1, r: 4, kind: "entity", label: "สาขา", domain: "people", href: "/branches", status: "table" },
  { id: "positions", c: 2, r: 3, kind: "entity", label: "ตำแหน่งงาน", domain: "people", href: "/positions", status: "rich" },
  { id: "employees", c: 3, r: 3, kind: "entity", label: "พนักงาน", domain: "people", href: "/employees", status: "rich" },
  { id: "org-chart", c: 4, r: 3, kind: "entity", label: "ผังองค์กร", domain: "people", href: "/org-chart", status: "rich" },

  // ── Recruitment pipeline ─────────────────────────────────────────
  { id: "recruitment", c: 0, r: 3, kind: "entity", label: "สรรหา", domain: "recruit", href: "/recruitment", status: "table" },
  { id: "applicants", c: 0, r: 4, kind: "entity", label: "ผู้สมัคร", domain: "recruit", href: "/applicants", status: "table" },
  { id: "rec-dec", c: 0, r: 5, kind: "decision", label: "ผ่าน?", domain: "recruit" },
  { id: "onboarding", c: 0, r: 6, kind: "entity", label: "Onboarding", domain: "recruit", href: "/onboarding", status: "table" },

  // ── Time & Leave ─────────────────────────────────────────────────
  { id: "schedules", c: 1, r: 6, kind: "entity", label: "ตารางงาน", domain: "time", href: "/schedules", status: "table" },
  { id: "attendance", c: 1, r: 7, kind: "entity", label: "บันทึกเวลา", domain: "time", href: "/attendance", status: "table" },
  { id: "leaves", c: 2, r: 6, kind: "entity", label: "การลา", domain: "time", href: "/leaves", status: "workflow" },
  { id: "leave-dec", c: 2, r: 7, kind: "decision", label: "อนุมัติ?", domain: "time" },
  { id: "leave-ok", c: 3, r: 6, kind: "terminal", label: "อนุมัติ", domain: "time" },
  { id: "leave-no", c: 3, r: 7, kind: "terminal", label: "ปฏิเสธ", domain: "time" },

  // ── Finance / Payroll ────────────────────────────────────────────
  { id: "overtime", c: 5, r: 6, kind: "entity", label: "OT", domain: "finance", href: "/overtime", status: "workflow" },
  { id: "commission", c: 5, r: 7, kind: "entity", label: "ค่าคอมมิชชั่น", domain: "finance", href: "/commission", status: "table" },
  { id: "payroll", c: 6, r: 6, kind: "entity", label: "เงินเดือน", domain: "finance", href: "/payroll", status: "table" },
  { id: "pay-out", c: 7, r: 6, kind: "terminal", label: "จ่ายเงินเดือน", domain: "finance" },
  { id: "expenses", c: 5, r: 8, kind: "entity", label: "เบิกค่าใช้จ่าย", domain: "finance", href: "/expenses", status: "workflow" },
  { id: "exp-dec", c: 6, r: 8, kind: "decision", label: "อนุมัติ?", domain: "finance" },
  { id: "exp-pay", c: 7, r: 8, kind: "terminal", label: "จ่ายคืน", domain: "finance" },

  // ── Meetings ─────────────────────────────────────────────────────
  { id: "meetings", c: 2, r: 9, kind: "entity", label: "บันทึกการประชุม", domain: "facility", href: "/meetings", status: "rich" },
  { id: "meeting-rooms", c: 3, r: 9, kind: "entity", label: "ห้องประชุม", domain: "facility", href: "/meeting-rooms", status: "rich" },

  // ── People development ───────────────────────────────────────────
  { id: "training", c: 0, r: 9, kind: "entity", label: "อบรม", domain: "develop", href: "/training", status: "table" },
  { id: "evaluation", c: 0, r: 10, kind: "entity", label: "ประเมินผล", domain: "develop", href: "/evaluation", status: "table" },
  { id: "okr", c: 0, r: 11, kind: "entity", label: "OKR", domain: "develop", href: "/okr", status: "table" },

  // ── HR resources ─────────────────────────────────────────────────
  { id: "documents", c: 1, r: 10, kind: "entity", label: "เอกสาร HR", domain: "resource", href: "/documents", status: "table" },
  { id: "assets", c: 2, r: 10, kind: "entity", label: "ทรัพย์สิน", domain: "resource", href: "/assets", status: "table" },
  { id: "benefits", c: 1, r: 11, kind: "entity", label: "สวัสดิการ", domain: "resource", href: "/benefits", status: "table" },
  { id: "social-security", c: 2, r: 11, kind: "entity", label: "ประกันสังคม", domain: "resource", href: "/social-security", status: "table" },

  // ── Communications & reports ─────────────────────────────────────
  { id: "announcements", c: 3, r: 11, kind: "entity", label: "ประกาศ", domain: "comm", href: "/announcements", status: "table" },
  { id: "reports", c: 4, r: 11, kind: "entity", label: "รายงาน", domain: "comm", href: "/reports", status: "table" },

  // ── System ───────────────────────────────────────────────────────
  { id: "users", c: 6, r: 10, kind: "entity", label: "จัดการผู้ใช้", domain: "system", href: "/users", status: "table" },
  { id: "settings", c: 7, r: 10, kind: "entity", label: "ตั้งค่า", domain: "system", href: "/settings", status: "table" },

  // ── Retail & Operations (self-contained cluster, right) ──────────
  { id: "campaigns", c: 9, r: 0, kind: "entity", label: "แคมเปญ", domain: "retail", href: "/campaigns", status: "table" },
  { id: "retail", c: 12, r: 0, kind: "entity", label: "Ops Dashboard", domain: "retail", href: "/retail", status: "rich" },
  { id: "products", c: 9, r: 2, kind: "entity", label: "สินค้า", domain: "retail", href: "/products", status: "table" },
  { id: "inventory", c: 9, r: 3, kind: "entity", label: "สต๊อก & คลัง", domain: "retail", href: "/inventory", status: "table" },
  { id: "warehouse-3d", c: 9, r: 4, kind: "entity", label: "โกดัง 3D", domain: "retail", href: "/warehouse-3d", status: "rich" },
  { id: "orders", c: 10, r: 2, kind: "entity", label: "คำสั่งซื้อ", domain: "retail", href: "/orders", status: "table" },
  { id: "ord-s1", c: 11, r: 1, kind: "process", label: "รอชำระ", domain: "retail" },
  { id: "ord-s2", c: 11, r: 2, kind: "process", label: "ชำระแล้ว", domain: "retail" },
  { id: "ord-s3", c: 11, r: 3, kind: "process", label: "แพ็ก", domain: "retail" },
  { id: "ord-s4", c: 11, r: 4, kind: "process", label: "จัดส่ง", domain: "retail" },
  { id: "ord-s5", c: 11, r: 5, kind: "terminal", label: "ส่งสำเร็จ", domain: "retail" },
  { id: "customers", c: 12, r: 3, kind: "entity", label: "ลูกค้า", domain: "retail", href: "/customers", status: "table" },
  { id: "stores", c: 9, r: 6, kind: "entity", label: "สาขาค้าปลีก", domain: "retail", href: "/stores", status: "table" },
  { id: "branch-map", c: 9, r: 7, kind: "entity", label: "แผนที่สาขา 3D", domain: "retail", href: "/branch-map", status: "rich" },
];

export const rawEdges: RawEdge[] = [
  // Work order lifecycle
  { from: "work-orders", to: "wo-pending" },
  { from: "wo-pending", to: "wo-dec" },
  { from: "wo-dec", to: "wo-progress", label: "อนุมัติ" },
  { from: "wo-dec", to: "wo-reject", label: "ไม่อนุมัติ" },
  { from: "wo-progress", to: "wo-done" },
  { from: "wo-done", to: "dashboard", label: "สรุป KPI" },
  { from: "employees", to: "work-orders", label: "ผู้รับผิดชอบ" },
  { from: "departments", to: "work-orders", label: "ผู้ขอ/ผู้รับ" },

  // HR backbone
  { from: "departments", to: "positions" },
  { from: "branches", to: "positions" },
  { from: "positions", to: "employees", label: "บรรจุ" },
  { from: "employees", to: "org-chart", label: "สายงาน" },

  // Recruitment → hire
  { from: "recruitment", to: "applicants" },
  { from: "applicants", to: "rec-dec" },
  { from: "rec-dec", to: "onboarding", label: "ผ่าน" },
  { from: "onboarding", to: "employees", label: "จ้างเข้าระบบ" },

  // Time & leave
  { from: "employees", to: "schedules" },
  { from: "employees", to: "attendance" },
  { from: "employees", to: "leaves" },
  { from: "leaves", to: "leave-dec" },
  { from: "leave-dec", to: "leave-ok", label: "อนุมัติ" },
  { from: "leave-dec", to: "leave-no", label: "ปฏิเสธ" },

  // Finance / payroll
  { from: "attendance", to: "payroll", label: "ชม.ทำงาน" },
  { from: "overtime", to: "payroll", label: "OT" },
  { from: "commission", to: "payroll", label: "คอมฯ" },
  { from: "employees", to: "payroll", label: "ฐานเงินเดือน" },
  { from: "social-security", to: "payroll", label: "หักประกัน" },
  { from: "payroll", to: "pay-out" },
  { from: "employees", to: "expenses" },
  { from: "expenses", to: "exp-dec" },
  { from: "exp-dec", to: "exp-pay", label: "อนุมัติ" },

  // Meetings
  { from: "meetings", to: "meeting-rooms", label: "จองห้อง" },
  { from: "meetings", to: "employees", label: "ผู้เข้าร่วม" },

  // Development
  { from: "employees", to: "training" },
  { from: "employees", to: "evaluation" },
  { from: "employees", to: "okr" },

  // Resources
  { from: "assets", to: "employees", label: "ผู้ถือครอง" },
  { from: "employees", to: "benefits", label: "สิทธิ" },

  // Comms & system
  { from: "announcements", to: "employees", label: "ผู้รับ" },
  { from: "users", to: "employees", label: "ผูกบัญชี" },

  // Retail flow
  { from: "products", to: "inventory" },
  { from: "inventory", to: "warehouse-3d", label: "มอง 3D" },
  { from: "products", to: "orders" },
  { from: "campaigns", to: "orders", label: "ขับยอด" },
  { from: "orders", to: "ord-s1" },
  { from: "ord-s1", to: "ord-s2" },
  { from: "ord-s2", to: "ord-s3" },
  { from: "ord-s3", to: "ord-s4" },
  { from: "ord-s4", to: "ord-s5" },
  { from: "orders", to: "customers", label: "ลูกค้า" },
  { from: "orders", to: "retail", label: "KPI ขาย" },
  { from: "stores", to: "branch-map", label: "มอง 3D" },
  { from: "stores", to: "branches", label: "อ้างสาขา HR" },
];

export const statusMeta: Record<ModStatus, { label: string; color: string }> = {
  rich: { label: "หน้าเฉพาะ (custom UI)", color: "#10b981" },
  table: { label: "ตาราง CRUD (module-config)", color: "#3b82f6" },
  workflow: { label: "ตาราง + อนุมัติ (approval)", color: "#8b5cf6" },
};
