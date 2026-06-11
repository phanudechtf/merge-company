"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Clock, CheckCircle2, XCircle, PlayCircle, ArrowRight, ArrowRightLeft, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { WorkOrder, WorkOrderStatus } from "@/lib/mock-work-orders";

interface WorkOrderCardProps {
  wo: WorkOrder;
  onView: (w: WorkOrder) => void;
  onEdit: (w: WorkOrder) => void;
  onDelete: (w: WorkOrder) => void;
  onApprove?: (w: WorkOrder) => void;
  onReject?: (w: WorkOrder) => void;
  onStatusChange?: (w: WorkOrder, status: WorkOrderStatus) => void;
  onMove?: (w: WorkOrder, status: WorkOrderStatus) => void;
  isMine?: boolean;
}

const moveOptions: { key: WorkOrderStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "pending_approval", label: "รอ Approve" },
  { key: "in_progress", label: "กำลังดำเนินการ" },
  { key: "done", label: "เสร็จสิ้น" },
];

const priorityConfig = {
  low:    { label: "ต่ำ",  bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  medium: { label: "ปกติ", bar: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border border-blue-100" },
  high:   { label: "สูง",  bar: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border border-orange-100" },
  urgent: { label: "ด่วน", bar: "bg-red-500",     badge: "bg-red-50 text-red-700 border border-red-100" },
};

const statusConfig: Record<WorkOrderStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "recruiting" | "outline" }> = {
  backlog:          { label: "Backlog",        variant: "outline" },
  pending_approval: { label: "รอ Approve",     variant: "warning" },
  approved:         { label: "Approved",       variant: "recruiting" },
  in_progress:      { label: "กำลังดำเนินการ", variant: "default" },
  done:             { label: "เสร็จสิ้น",      variant: "success" },
  rejected:         { label: "ถูกปฏิเสธ",     variant: "destructive" },
  cancelled:        { label: "ยกเลิก",         variant: "outline" },
};

function isOverdue(dueDate: string, status: WorkOrderStatus) {
  if (status === "done" || status === "cancelled" || status === "rejected") return false;
  return new Date(dueDate) < new Date();
}

export function WorkOrderCard({ wo, onView, onEdit, onDelete, onApprove, onReject, onStatusChange, onMove, isMine }: WorkOrderCardProps) {
  const priority = priorityConfig[wo.priority];
  const status = statusConfig[wo.status];
  const overdue = isOverdue(wo.dueDate, wo.status);
  const displayAssignees = wo.assignees ?? [];
  const attachCount = wo.attachments?.length ?? 0;
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <div className={cn(
      "bg-white rounded-xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col",
      isMine ? "border-gold-300 ring-2 ring-gold-200" : "border-slate-200"
    )}>
      {/* Priority bar */}
      <div className={cn("h-1 w-full", priority.bar)} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-slate-400 font-mono">{wo.code}</span>
              {isMine && <span className="text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-semibold">ของฉัน</span>}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-3" title={wo.title}>{wo.title}</h3>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", priority.badge)}>
              {priority.label}
            </span>
          </div>
        </div>

        {/* Flow: requester dept → assignees */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
              {wo.requester.avatarInitials}
            </div>
            <span className="truncate text-slate-500 max-w-[70px]">{wo.requesterDept.name}</span>
          </div>
          <ArrowRight size={11} className="text-slate-300 shrink-0" />
          {/* Stacked avatars for multiple assignees */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center -space-x-1.5">
              {displayAssignees.slice(0, 3).map((a, i) => (
                <div
                  key={a.id}
                  title={a.fullName}
                  className="w-5 h-5 rounded-full bg-gold-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gold-700 shrink-0"
                  style={{ zIndex: 3 - i }}
                >
                  {a.avatarInitials.slice(0, 2)}
                </div>
              ))}
              {displayAssignees.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600 shrink-0">
                  +{displayAssignees.length - 3}
                </div>
              )}
            </div>
            <span className="truncate max-w-[70px]">
              {displayAssignees.length === 0
                ? "ไม่ระบุ"
                : displayAssignees.length === 1
                ? displayAssignees[0].firstName
                : `${displayAssignees.length} คน`}
            </span>
          </div>
        </div>

        {/* Due date */}
        <div className={cn("flex items-center gap-1.5 text-xs", overdue ? "text-red-500 font-medium" : "text-slate-500")}>
          <Clock size={12} className="shrink-0" />
          <span>กำหนด {formatDate(wo.dueDate)}</span>
          {overdue && <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded">เกินกำหนด</span>}
          {attachCount > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-slate-400" title={`${attachCount} ไฟล์แนบ`}>
              <Paperclip size={11} /> {attachCount}
            </span>
          )}
        </div>

        {/* Approval actions */}
        {wo.status === "pending_approval" && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onApprove?.(wo)}
              className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 size={12} /> Approve
            </button>
            <button
              onClick={() => onReject?.(wo)}
              className="flex-1 flex items-center justify-center gap-1 h-7 rounded-md bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        )}

        {wo.status === "approved" && (
          <button
            onClick={() => onStatusChange?.(wo, "in_progress")}
            className="flex items-center justify-center gap-1 h-7 rounded-md bg-gold-50 text-gold-700 text-xs font-medium hover:bg-gold-100 transition-colors"
          >
            <PlayCircle size={12} /> เริ่มดำเนินการ
          </button>
        )}
        {wo.status === "in_progress" && (
          <button
            onClick={() => onStatusChange?.(wo, "done")}
            className="flex items-center justify-center gap-1 h-7 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle2 size={12} /> ทำเสร็จแล้ว
          </button>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">{formatDate(wo.updatedAt)}</p>
          <div className="flex items-center gap-1">
            {onMove && (
              <div className="relative">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-gold-600" onClick={() => setMoveOpen((v) => !v)} title="ย้ายสถานะ">
                  <ArrowRightLeft size={13} />
                </Button>
                {moveOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoveOpen(false)} />
                    <div className="absolute bottom-full right-0 mb-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[150px]">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">ย้ายไปยัง</p>
                      {moveOptions.filter((o) => o.key !== wo.status).map((o) => (
                        <button
                          key={o.key}
                          onClick={() => { onMove(wo, o.key); setMoveOpen(false); }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-gold-50 hover:text-gold-700 transition-colors"
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-gold-600" onClick={() => onView(wo)} title="ดู">
              <Eye size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => onEdit(wo)} title="แก้ไข">
              <Pencil size={13} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-500" onClick={() => onDelete(wo)} title="ลบ">
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
