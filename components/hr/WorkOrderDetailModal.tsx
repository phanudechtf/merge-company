"use client";

import { X, CheckCircle2, User, Users, Building2, Calendar, MessageSquare, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/lib/mock-work-orders";

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
  onEdit: (wo: WorkOrder) => void;
}

const statusLabel: Record<WorkOrderStatus, string> = {
  backlog:     "Backlog",
  in_progress: "กำลังดำเนินการ",
  done:        "เสร็จสิ้น",
  cancelled:   "ยกเลิก",
};

const statusVariant: Record<WorkOrderStatus, "default" | "success" | "warning" | "destructive" | "recruiting" | "outline"> = {
  backlog:     "outline",
  in_progress: "default",
  done:        "success",
  cancelled:   "outline",
};

const priorityLabel: Record<string, { label: string; color: string; bar: string }> = {
  low:    { label: "ต่ำ",  color: "text-emerald-700 bg-emerald-50 border border-emerald-100", bar: "bg-emerald-400" },
  medium: { label: "ปกติ", color: "text-blue-700 bg-blue-50 border border-blue-100",         bar: "bg-blue-400" },
  high:   { label: "สูง",  color: "text-orange-700 bg-orange-50 border border-orange-100",   bar: "bg-orange-400" },
  urgent: { label: "ด่วน", color: "text-red-700 bg-red-50 border border-red-100",            bar: "bg-red-500" },
};

function isOverdue(dueDate: string, status: WorkOrderStatus) {
  if (status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
}

function dueDateBadge(dueDate: string, status: WorkOrderStatus) {
  if (status === "done" || status === "cancelled") return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `เกินกำหนด ${Math.abs(diffDays)} วัน`, cls: "bg-red-100 text-red-700" };
  if (diffDays === 0) return { label: "ครบกำหนดวันนี้", cls: "bg-orange-100 text-orange-700" };
  if (diffDays === 1) return { label: "ครบกำหนดพรุ่งนี้", cls: "bg-amber-100 text-amber-700" };
  if (diffDays <= 3) return { label: `อีก ${diffDays} วัน`, cls: "bg-yellow-100 text-yellow-700" };
  return null;
}

function buildTimeline(wo: WorkOrder) {
  const events: { icon: React.ElementType; iconColor: string; label: string; detail?: string; time: string }[] = [];

  events.push({
    icon: FileText, iconColor: "text-slate-500",
    label: "สร้างงาน",
    detail: `โดย ${wo.requester.fullName} (${wo.requesterDept.name})`,
    time: wo.createdAt,
  });

  if (wo.status === "in_progress" || wo.status === "done") {
    events.push({
      icon: CheckCircle2, iconColor: "text-gold-500",
      label: "เริ่มดำเนินการ",
      detail: `ผู้รับผิดชอบ: ${wo.assignees.map((a) => a.firstName).join(", ")}`,
      time: wo.updatedAt,
    });
  }

  if (wo.status === "done" && wo.completedAt) {
    events.push({
      icon: CheckCircle2, iconColor: "text-emerald-600",
      label: "เสร็จสิ้น",
      time: wo.completedAt,
    });
  }

  return events;
}

const mockComments = [
  { id: 1, author: "สมชาย ใจดี", initials: "สช", time: "8 มิ.ย. 2569 09:15", text: "รับทราบ กำลังตรวจสอบข้อมูลเบื้องต้น" },
  { id: 2, author: "อรทัย พิมพ์ใจ", initials: "อท", time: "8 มิ.ย. 2569 14:30", text: "ได้รับเอกสารแล้ว จะดำเนินการภายใน 2 วันทำการ" },
];

export function WorkOrderDetailModal({ workOrder: wo, onClose, onEdit }: WorkOrderDetailModalProps) {
  const priority = priorityLabel[wo.priority];
  const overdue = isOverdue(wo.dueDate, wo.status);
  const badge = dueDateBadge(wo.dueDate, wo.status);
  const timeline = buildTimeline(wo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Priority bar */}
        <div className={cn("h-1.5 w-full shrink-0", priority.bar)} />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">{wo.code}</span>
              <Badge variant={statusVariant[wo.status]}>{statusLabel[wo.status]}</Badge>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priority.color)}>{priority.label}</span>
              {badge && <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", badge.cls)}>{badge.label}</span>}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{wo.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left — main content */}
            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: "ผู้สร้างงาน", value: wo.requester.fullName },
                  { icon: Building2, label: "แผนกผู้สร้าง", value: wo.requesterDept.name },
                  { icon: Users, label: "ผู้รับผิดชอบ", value: wo.assignees.length > 0 ? wo.assignees.map((a) => a.fullName).join(", ") : "ไม่ระบุ" },
                  { icon: Building2, label: "แผนกรับงาน", value: wo.assigneeDept.name },
                  { icon: Calendar, label: "กำหนดเสร็จ", value: formatDate(wo.dueDate), extra: overdue ? "text-red-600 font-semibold" : "" },
                  ...(wo.startDate ? [{ icon: Calendar, label: "วันเริ่มต้น", value: formatDate(wo.startDate), extra: "" }] : []),
                  ...(wo.completedAt ? [{ icon: CheckCircle2, label: "วันเสร็จสิ้น", value: formatDate(wo.completedAt), extra: "" }] : []),
                ].map(({ icon: Icon, label, value, extra }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-slate-400" />
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                    </div>
                    <p className={cn("text-sm font-medium text-slate-800 leading-snug", extra)}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {wo.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">รายละเอียด</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{wo.description}</p>
                </div>
              )}

              {/* Notes */}
              {wo.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">หมายเหตุ</p>
                  <p className="text-sm text-slate-600 bg-amber-50 rounded-xl p-4 leading-relaxed">{wo.notes}</p>
                </div>
              )}

              {/* Attachments & links */}
              {wo.attachments && wo.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">ไฟล์แนบ & ลิงก์</p>
                  <div className="space-y-2">
                    {wo.attachments.map((f, i) => f.kind === "image" ? (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="block group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.url} alt={f.name} className="w-full max-h-52 object-cover rounded-xl border border-slate-200" />
                        <p className="text-xs text-slate-500 truncate mt-1 group-hover:text-gold-600">{f.name}</p>
                      </a>
                    ) : (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Link2 size={14} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-blue-500 truncate">{f.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock Comments */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">ความคิดเห็น</p>
                <div className="space-y-3">
                  {mockComments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center text-[10px] font-bold text-gold-700 shrink-0">
                        {c.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <p className="text-xs font-semibold text-slate-800">{c.author}</p>
                          <p className="text-[10px] text-slate-400">{c.time}</p>
                        </div>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 leading-snug">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                      ผA
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="เพิ่มความคิดเห็น..."
                      />
                      <button className="px-3 py-2 bg-gold-600 text-white text-xs font-medium rounded-xl hover:bg-gold-700 transition-colors">
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — timeline + meta */}
            <div className="p-5 space-y-5 bg-slate-50/50">
              {/* Assignee avatars */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">ผู้รับผิดชอบ</p>
                <div className="space-y-2">
                  {wo.assignees.map((a) => (
                    <div key={a.id} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center text-[10px] font-bold text-gold-700 shrink-0">
                        {a.avatarInitials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-800">{a.fullName}</p>
                        <p className="text-[10px] text-slate-400">{a.positionName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates meta */}
              <div className="text-[10px] text-slate-400 space-y-1 border-t border-slate-200 pt-4">
                <p>สร้างเมื่อ: <span className="text-slate-600">{formatDateTime(wo.createdAt)}</span></p>
                <p>อัปเดตล่าสุด: <span className="text-slate-600">{formatDateTime(wo.updatedAt)}</span></p>
              </div>

              {/* Activity Timeline */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Activity</p>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-4">
                    {timeline.map((event, i) => {
                      const Icon = event.icon;
                      return (
                        <div key={i} className="flex gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10">
                            <Icon size={10} className={event.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <p className="text-xs font-semibold text-slate-700">{event.label}</p>
                            {event.detail && <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{event.detail}</p>}
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(event.time)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>ปิด</Button>
          <Button size="sm" className="flex-1" onClick={() => { onClose(); onEdit(wo); }}>แก้ไขงาน</Button>
        </div>
      </div>
    </div>
  );
}
