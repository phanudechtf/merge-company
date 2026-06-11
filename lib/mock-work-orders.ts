import type { MockEmployee } from "./mock-employees";
import { mockEmployees } from "./mock-employees";
import { departments } from "./mock-db";
import type { Department } from "@/types";

export type WorkOrderStatus = "backlog" | "pending_approval" | "approved" | "in_progress" | "done" | "rejected" | "cancelled";
export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

export interface WorkOrderAttachment {
  name: string;
  url: string;
  kind: "link" | "image";
}

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  description?: string;
  priority: WorkOrderPriority;

  requesterId: string;
  requester: MockEmployee;
  requesterDeptId: string;
  requesterDept: Department;

  assigneeIds: string[];
  assignees: MockEmployee[];
  assigneeDeptId: string;
  assigneeDept: Department;

  startDate?: string;
  dueDate: string;
  completedAt?: string;

  status: WorkOrderStatus;
  approverId?: string;
  approver?: MockEmployee;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  attachments?: WorkOrderAttachment[];

  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderCreateInput {
  title: string;
  description?: string;
  priority: WorkOrderPriority;
  requesterId: string;
  requesterDeptId: string;
  assigneeIds: string[];
  assigneeDeptId: string;

  startDate?: string;
  dueDate: string;
  notes?: string;
  attachments?: WorkOrderAttachment[];
}

function emp(id: string) { return mockEmployees.find((e) => e.id === id)!; }
function emps(ids: string[]) { return ids.map((id) => mockEmployees.find((e) => e.id === id)!).filter(Boolean); }
function dept(id: string) { return departments.find((d) => d.id === id)!; }

let counter = 9;
function nextCode() {
  counter++;
  return `WO-2026-${String(counter).padStart(3, "0")}`;
}

const seed: WorkOrder[] = [
  {
    id: "wo-1", code: "WO-2026-001", title: "ขอซื้อ MacBook Pro 14\" สำหรับทีม Design",
    description: "ต้องการ MacBook Pro 14\" M4 จำนวน 2 เครื่อง สำหรับ Fashion Designer ที่เพิ่งรับเข้ามาใหม่",
    priority: "high",
    requesterId: "emp-12", requester: emp("emp-12"), requesterDeptId: "dept-9", requesterDept: dept("dept-9"),
    assigneeIds: ["emp-7", "emp-8"], assignees: emps(["emp-7", "emp-8"]),
    assigneeDeptId: "dept-2", assigneeDept: dept("dept-2"),
    dueDate: "2026-06-20T00:00:00.000Z",
    status: "pending_approval",
    createdAt: "2026-06-08T09:00:00.000Z", updatedAt: "2026-06-08T09:00:00.000Z",
  },
  {
    id: "wo-2", code: "WO-2026-002", title: "ตกแต่งใหม่ร้าน Siam Square",
    description: "Renovation พื้นที่ขาย 200 ตร.ม. เปลี่ยน fixture ใหม่ทั้งหมด ตาม concept season ใหม่",
    priority: "urgent",
    requesterId: "emp-15", requester: emp("emp-15"), requesterDeptId: "dept-10", requesterDept: dept("dept-10"),
    assigneeIds: ["emp-11"], assignees: emps(["emp-11"]),
    assigneeDeptId: "dept-3", assigneeDept: dept("dept-3"),
    dueDate: "2026-06-30T00:00:00.000Z", startDate: "2026-06-15T00:00:00.000Z",
    status: "approved",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-09T10:00:00.000Z",
    createdAt: "2026-06-07T14:00:00.000Z", updatedAt: "2026-06-09T10:00:00.000Z",
  },
  {
    id: "wo-3", code: "WO-2026-003", title: "จัดซื้อกล้อง CCTV เพิ่มสาขา Mega Bangna",
    description: "กล้อง IP 4K จำนวน 8 ตัว พร้อม NVR และ monitor สำหรับ security ร้าน",
    priority: "medium",
    requesterId: "emp-15", requester: emp("emp-15"), requesterDeptId: "dept-10", requesterDept: dept("dept-10"),
    assigneeIds: ["emp-14"], assignees: emps(["emp-14"]),
    assigneeDeptId: "dept-4", assigneeDept: dept("dept-4"),
    dueDate: "2026-07-15T00:00:00.000Z",
    status: "in_progress",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-05T11:00:00.000Z",
    createdAt: "2026-06-01T09:00:00.000Z", updatedAt: "2026-06-05T11:00:00.000Z",
  },
  {
    id: "wo-4", code: "WO-2026-004", title: "อบรม Excel Advanced สำหรับทีม HR",
    description: "จัดอบรม Excel สูตร Pivot Table, Power Query สำหรับทีม HR 5 คน",
    priority: "low",
    requesterId: "emp-3", requester: emp("emp-3"), requesterDeptId: "dept-6", requesterDept: dept("dept-6"),
    assigneeIds: ["emp-3", "emp-4"], assignees: emps(["emp-3", "emp-4"]),
    assigneeDeptId: "dept-6", assigneeDept: dept("dept-6"),
    dueDate: "2026-07-01T00:00:00.000Z",
    status: "done",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-05-20T09:00:00.000Z",
    completedAt: "2026-06-01T17:00:00.000Z",
    createdAt: "2026-05-15T10:00:00.000Z", updatedAt: "2026-06-01T17:00:00.000Z",
  },
  {
    id: "wo-5", code: "WO-2026-005", title: "ทำ Campaign Lookbook Summer 2026",
    description: "ผลิต lookbook ดิจิตัล + print สำหรับ collection summer รวม 30 หน้า",
    priority: "high",
    requesterId: "emp-9", requester: emp("emp-9"), requesterDeptId: "dept-8", requesterDept: dept("dept-8"),
    assigneeIds: ["emp-12", "emp-9"], assignees: emps(["emp-12", "emp-9"]),
    assigneeDeptId: "dept-9", assigneeDept: dept("dept-9"),
    dueDate: "2026-06-25T00:00:00.000Z", startDate: "2026-06-10T00:00:00.000Z",
    status: "in_progress",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-05T09:00:00.000Z",
    createdAt: "2026-06-03T11:00:00.000Z", updatedAt: "2026-06-05T09:00:00.000Z",
  },
  {
    id: "wo-6", code: "WO-2026-006", title: "ซ่อม AC สาขา Fashion Island",
    description: "เครื่อง AC โซน A ฉีก coolant ต้องเติมน้ำยาและเปลี่ยน coil",
    priority: "urgent",
    requesterId: "emp-15", requester: emp("emp-15"), requesterDeptId: "dept-10", requesterDept: dept("dept-10"),
    assigneeIds: ["emp-14"], assignees: emps(["emp-14"]),
    assigneeDeptId: "dept-4", assigneeDept: dept("dept-4"),
    dueDate: "2026-06-12T00:00:00.000Z",
    status: "pending_approval",
    createdAt: "2026-06-10T07:00:00.000Z", updatedAt: "2026-06-10T07:00:00.000Z",
  },
  {
    id: "wo-7", code: "WO-2026-007", title: "พัฒนาระบบ POS สาขาใหม่",
    description: "ติดตั้งและ configure POS system สำหรับสาขา The Mall Bangkapi",
    priority: "high",
    requesterId: "emp-7", requester: emp("emp-7"), requesterDeptId: "dept-2", requesterDept: dept("dept-2"),
    assigneeIds: ["emp-7", "emp-8"], assignees: emps(["emp-7", "emp-8"]),
    assigneeDeptId: "dept-2", assigneeDept: dept("dept-2"),
    dueDate: "2026-07-01T00:00:00.000Z",
    status: "approved",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-09T14:00:00.000Z",
    createdAt: "2026-06-08T10:00:00.000Z", updatedAt: "2026-06-09T14:00:00.000Z",
  },
  {
    id: "wo-8", code: "WO-2026-008", title: "จัดทำ Payroll Report Q2 2026",
    description: "สรุปรายงานเงินเดือน + bonus Q2 สำหรับนำเสนอ CFO",
    priority: "medium",
    requesterId: "emp-5", requester: emp("emp-5"), requesterDeptId: "dept-5", requesterDept: dept("dept-5"),
    assigneeIds: ["emp-6"], assignees: emps(["emp-6"]),
    assigneeDeptId: "dept-5", assigneeDept: dept("dept-5"),
    dueDate: "2026-06-30T00:00:00.000Z",
    status: "rejected",
    rejectionReason: "ข้อมูลยังไม่ครบ รอสรุปยอดสาขาปลายเดือน",
    createdAt: "2026-06-06T09:00:00.000Z", updatedAt: "2026-06-07T11:00:00.000Z",
  },
  {
    id: "wo-9", code: "WO-2026-009", title: "อัปเดต Brand Identity Guideline ปี 2026",
    description: "ปรับ logo usage, color palette, typography ให้ตรง direction ใหม่ของแบรนด์",
    priority: "medium",
    requesterId: "emp-9", requester: emp("emp-9"), requesterDeptId: "dept-8", requesterDept: dept("dept-8"),
    assigneeIds: ["emp-12"], assignees: emps(["emp-12"]),
    assigneeDeptId: "dept-9", assigneeDept: dept("dept-9"),
    dueDate: "2026-07-15T00:00:00.000Z",
    status: "backlog",
    createdAt: "2026-06-10T08:00:00.000Z", updatedAt: "2026-06-10T08:00:00.000Z",
  },
  {
    id: "wo-10", code: "WO-2026-010", title: "เตรียมของ Staff สาขาใหม่ Central Westgate",
    description: "จัดซื้อ uniform, อุปกรณ์ประจำตัว, ป้ายชื่อ สำหรับพนักงานใหม่ 12 คน",
    priority: "high",
    requesterId: "emp-15", requester: emp("emp-15"), requesterDeptId: "dept-10", requesterDept: dept("dept-10"),
    assigneeIds: ["emp-14", "emp-3"], assignees: emps(["emp-14", "emp-3"]),
    assigneeDeptId: "dept-4", assigneeDept: dept("dept-4"),
    dueDate: "2026-06-28T00:00:00.000Z",
    status: "backlog",
    createdAt: "2026-06-09T11:00:00.000Z", updatedAt: "2026-06-09T11:00:00.000Z",
  },
  {
    id: "wo-11", code: "WO-2026-011", title: "ออกแบบ KV แคมเปญ Merge Zaap on Sale 2026",
    description: "Key Visual หลัก + AW offline หน้า 18-20 สำหรับ Mid-Year Sale ขอแนวตั้ง+แนวนอน 16:9 / 9:16 Hi-Res",
    priority: "urgent",
    requesterId: "emp-10", requester: emp("emp-10"), requesterDeptId: "dept-8", requesterDept: dept("dept-8"),
    assigneeIds: ["emp-9"], assignees: emps(["emp-9"]),
    assigneeDeptId: "dept-8", assigneeDept: dept("dept-8"),
    dueDate: "2026-06-15T00:00:00.000Z", startDate: "2026-06-11T00:00:00.000Z",
    status: "pending_approval",
    attachments: [{ name: "Brief — Merge Zaap on Sale 2026", url: "https://docs.google.com/presentation", kind: "link" }],
    createdAt: "2026-06-11T08:30:00.000Z", updatedAt: "2026-06-11T08:30:00.000Z",
  },
  {
    id: "wo-12", code: "WO-2026-012", title: "Retouch Pack Shot คอลใหม่ A Day with Heart",
    description: "รีทัชแพ็คช็อต 26 ชิ้นสำหรับ PDP + Branding โชว์ยืนส์และกระเป๋า",
    priority: "high",
    requesterId: "emp-1", requester: emp("emp-1"), requesterDeptId: "dept-1", requesterDept: dept("dept-1"),
    assigneeIds: ["emp-9", "emp-12"], assignees: emps(["emp-9", "emp-12"]),
    assigneeDeptId: "dept-8", assigneeDept: dept("dept-8"),
    dueDate: "2026-06-18T00:00:00.000Z", startDate: "2026-06-11T00:00:00.000Z",
    status: "in_progress",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-11T09:30:00.000Z",
    createdAt: "2026-06-10T16:00:00.000Z", updatedAt: "2026-06-11T09:30:00.000Z",
  },
  {
    id: "wo-13", code: "WO-2026-013", title: "AW ตกแต่งหน้าร้านสุวรรณภูมิ",
    description: "Artwork ตกแต่งหน้าร้าน 14 ชิ้น + Packaging Design สุวรรณภูมิ",
    priority: "medium",
    requesterId: "emp-2", requester: emp("emp-2"), requesterDeptId: "dept-1", requesterDept: dept("dept-1"),
    assigneeIds: ["emp-9"], assignees: emps(["emp-9"]),
    assigneeDeptId: "dept-8", assigneeDept: dept("dept-8"),
    dueDate: "2026-06-21T00:00:00.000Z",
    status: "approved",
    approverId: "emp-2", approver: emp("emp-2"), approvedAt: "2026-06-10T13:00:00.000Z",
    createdAt: "2026-06-09T14:00:00.000Z", updatedAt: "2026-06-10T13:00:00.000Z",
  },
];

let workOrders: WorkOrder[] = [...seed];

export function getWorkOrders(): WorkOrder[] { return workOrders; }

export function getWorkOrderById(id: string): WorkOrder | undefined {
  return workOrders.find((w) => w.id === id);
}

export function createWorkOrder(input: WorkOrderCreateInput): WorkOrder {
  const requester = mockEmployees.find((e) => e.id === input.requesterId)!;
  const requesterDept = departments.find((d) => d.id === input.requesterDeptId)!;
  const assigneesData = emps(input.assigneeIds);
  const assigneeDept = departments.find((d) => d.id === input.assigneeDeptId)!;
  if (!requester || !requesterDept || assigneesData.length === 0 || !assigneeDept) throw new Error("Invalid reference");

  const wo: WorkOrder = {
    ...input,
    id: `wo-${Date.now()}`,
    code: nextCode(),
    requester,
    requesterDept,
    assignees: assigneesData,
    assigneeDept,
    status: "backlog",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  workOrders = [...workOrders, wo];
  return wo;
}

export function updateWorkOrder(id: string, input: Partial<WorkOrderCreateInput>): WorkOrder | null {
  const idx = workOrders.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const existing = workOrders[idx];
  const requester = input.requesterId ? mockEmployees.find((e) => e.id === input.requesterId) ?? existing.requester : existing.requester;
  const requesterDept = input.requesterDeptId ? departments.find((d) => d.id === input.requesterDeptId) ?? existing.requesterDept : existing.requesterDept;
  const assigneesData = input.assigneeIds ? emps(input.assigneeIds) : existing.assignees;
  const assigneeDept = input.assigneeDeptId ? departments.find((d) => d.id === input.assigneeDeptId) ?? existing.assigneeDept : existing.assigneeDept;
  const updated: WorkOrder = {
    ...existing, ...input,
    requester, requesterDept,
    assignees: assigneesData, assigneeDept,
    updatedAt: new Date().toISOString(),
  };
  workOrders = workOrders.map((w) => (w.id === id ? updated : w));
  return updated;
}

export function approveWorkOrder(id: string, approverId: string): WorkOrder | null {
  const idx = workOrders.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const approver = mockEmployees.find((e) => e.id === approverId);
  const updated: WorkOrder = {
    ...workOrders[idx], status: "approved",
    approverId, approver, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  workOrders = workOrders.map((w) => (w.id === id ? updated : w));
  return updated;
}

export function rejectWorkOrder(id: string, approverId: string, reason: string): WorkOrder | null {
  const idx = workOrders.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated: WorkOrder = {
    ...workOrders[idx], status: "rejected",
    approverId, rejectionReason: reason, updatedAt: new Date().toISOString(),
  };
  workOrders = workOrders.map((w) => (w.id === id ? updated : w));
  return updated;
}

export function updateWorkOrderStatus(id: string, status: WorkOrderStatus): WorkOrder | null {
  const idx = workOrders.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated: WorkOrder = {
    ...workOrders[idx], status,
    completedAt: status === "done" ? new Date().toISOString() : workOrders[idx].completedAt,
    updatedAt: new Date().toISOString(),
  };
  workOrders = workOrders.map((w) => (w.id === id ? updated : w));
  return updated;
}

export function deleteWorkOrder(id: string): boolean {
  const before = workOrders.length;
  workOrders = workOrders.filter((w) => w.id !== id);
  return workOrders.length < before;
}

export function getWorkOrderStats() {
  return {
    total: workOrders.length,
    pendingApproval: workOrders.filter((w) => w.status === "pending_approval").length,
    inProgress: workOrders.filter((w) => w.status === "in_progress").length,
    done: workOrders.filter((w) => w.status === "done").length,
    approved: workOrders.filter((w) => w.status === "approved").length,
  };
}
