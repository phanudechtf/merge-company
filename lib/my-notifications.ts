import { getWorkOrders, type WorkOrderStatus, type WorkOrderPriority } from "./mock-work-orders";
import { mockEmployees } from "./mock-employees";
import { departments } from "./mock-db";

export type MyNotiKind = "assignment" | "announcement" | "mention";

export interface MyNotification {
  id: string;
  kind: MyNotiKind;
  title: string;
  detail?: string;
  fromName: string;
  fromInitials: string;
  time: string;
  href: string;
  meta?: {
    code?: string;
    due?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    assignees?: string;
    audience?: string;
  };
}

// ประกาศ (mock) — audience: "all" = ทุกคน, หรือ departmentId = เฉพาะแผนกนั้น
interface Announcement {
  id: string;
  title: string;
  detail: string;
  fromId: string;
  audience: "all" | string;
  time: string;
}

const announcements: Announcement[] = [
  { id: "an-1", title: "ประกาศวันหยุดบริษัท ก.ค. 2026", detail: "หยุดยาว 28-30 ก.ค. ชดเชยวันอาสาฬหบูชา", fromId: "emp-3", audience: "all", time: "2 ชม. ที่แล้ว" },
  { id: "an-2", title: "นัดประชุมทีม Creative ก่อนเปิดแคมเปญ", detail: "ประชุม direction Mid-Year Sale ศุกร์นี้ 14:00 ห้อง Studio", fromId: "emp-1", audience: "dept-8", time: "เมื่อวาน" },
  { id: "an-3", title: "อบรม Adobe Firefly สำหรับทีมออกแบบ", detail: "เปิดรับสมัครทีม Creative อบรม AI tool 20 มิ.ย.", fromId: "emp-3", audience: "dept-8", time: "2 วันที่แล้ว" },
  { id: "an-4", title: "อัปเดตระเบียบการเบิกค่าใช้จ่าย", detail: "ปรับเพดานเบิก OT ทุกแผนก เริ่ม 1 ก.ค.", fromId: "emp-5", audience: "all", time: "3 วันที่แล้ว" },
];

// @mention ในคอมเมนต์งาน (mock)
interface Mention {
  id: string;
  fromId: string;
  context: string;
  snippet: string;
  href: string;
  time: string;
}

const mentions: Mention[] = [
  { id: "mn-1", fromId: "emp-10", context: "WO-2026-011 · KV แคมเปญ", snippet: "ฝากเช็ค mood ของ KV เวอร์ชันแนวตั้งด้วยนะ", href: "/work-orders/dept-8?focus=wo-11", time: "30 นาทีที่แล้ว" },
  { id: "mn-2", fromId: "emp-1", context: "WO-2026-012 · Retouch Pack Shot", snippet: "งานนี้ใช้เปิดวันคอนเสิร์ต รบกวนเร่งหน่อย", href: "/work-orders/dept-8?focus=wo-12", time: "1 ชม. ที่แล้ว" },
];

function findEmp(id: string) {
  return mockEmployees.find((e) => e.id === id);
}

function deptName(id: string) {
  return departments.find((d) => d.id === id)?.name ?? id;
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "เมื่อสักครู่";
  if (h < 24) return `${h} ชม. ที่แล้ว`;
  const d = Math.floor(h / 24);
  return d === 1 ? "เมื่อวาน" : `${d} วันที่แล้ว`;
}

export function getMyNotifications(userId: string): MyNotification[] {
  const meDept = findEmp(userId)?.departmentId;

  // งานที่คนอื่นสั่ง/มอบหมายถึงฉัน (ฉันเป็น assignee, ฉันไม่ใช่คนสั่ง, ยังไม่ปิด)
  const assignments: MyNotification[] = getWorkOrders()
    .filter(
      (w) =>
        w.assigneeIds.includes(userId) &&
        w.requesterId !== userId &&
        !["done", "rejected", "cancelled"].includes(w.status)
    )
    .map((w) => ({
      id: `as-${w.id}`,
      kind: "assignment" as const,
      title: `${w.requester.fullName} สั่งงานถึงคุณ`,
      detail: w.title,
      fromName: w.requester.fullName,
      fromInitials: w.requester.avatarInitials,
      time: relTime(w.createdAt),
      href: `/work-orders/${w.assigneeDeptId}?focus=${w.id}`,
      meta: {
        code: w.code,
        due: w.dueDate,
        status: w.status,
        priority: w.priority,
        assignees: w.assignees.map((a) => a.firstName).join(", "),
      },
    }));

  const mentionNotis: MyNotification[] = mentions.map((m) => {
    const f = findEmp(m.fromId)!;
    return {
      id: m.id,
      kind: "mention" as const,
      title: `${f.fullName} กล่าวถึงคุณ`,
      detail: m.snippet,
      fromName: f.fullName,
      fromInitials: f.avatarInitials,
      time: m.time,
      href: m.href,
      meta: { code: m.context },
    };
  });

  const annNotis: MyNotification[] = announcements
    .filter((a) => a.audience === "all" || a.audience === meDept)
    .map((a) => {
      const f = findEmp(a.fromId)!;
      return {
        id: a.id,
        kind: "announcement" as const,
        title: a.title,
        detail: a.detail,
        fromName: f.fullName,
        fromInitials: f.avatarInitials,
        time: a.time,
        href: "/announcements",
        meta: { audience: a.audience === "all" ? "ถึงทุกคน" : `ถึงแผนก ${deptName(a.audience)}` },
      };
    });

  return [...assignments, ...mentionNotis, ...annNotis];
}
