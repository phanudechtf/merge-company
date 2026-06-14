"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, ArrowLeft, ClipboardList, Loader2, ChevronDown, AlertTriangle, PlayCircle, CheckCircle2, UserCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WorkOrderCard } from "@/components/hr/WorkOrderCard";
import { WorkOrderModal } from "@/components/hr/WorkOrderModal";
import { WorkOrderDetailModal } from "@/components/hr/WorkOrderDetailModal";
import { DeleteConfirmModal } from "@/components/hr/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useProfile } from "@/components/layout/ProfileContext";
import { cn } from "@/lib/utils";
import { departments } from "@/lib/mock-db";
import { mockEmployees } from "@/lib/mock-employees";
import type { WorkOrder, WorkOrderStatus } from "@/lib/mock-work-orders";
import type { Position } from "@/types";

const COLUMNS: {
  key: WorkOrderStatus;
  label: string;
  dotColor: string;
  headerBg: string;
  borderColor: string;
  countBg: string;
}[] = [
  { key: "backlog",          label: "Backlog",          dotColor: "bg-slate-400",   headerBg: "bg-slate-50",    borderColor: "border-slate-200",   countBg: "bg-slate-200 text-slate-700" },
  { key: "in_progress",      label: "กำลังดำเนินการ",  dotColor: "bg-gold-500",  headerBg: "bg-gold-50",   borderColor: "border-gold-200",  countBg: "bg-gold-100 text-gold-700" },
  { key: "done",             label: "เสร็จสิ้น",        dotColor: "bg-emerald-500", headerBg: "bg-emerald-50",  borderColor: "border-emerald-200", countBg: "bg-emerald-100 text-emerald-700" },
];

// จุด accent ต่อแผนก — แค่สีเล็ก คุมโทน banner เป็น ink เสมอ
const deptAccent: Record<string, string> = {
  "dept-1":  "bg-slate-400",   "dept-2":  "bg-gold-500",
  "dept-3":  "bg-teal-400",    "dept-4":  "bg-amber-400",
  "dept-5":  "bg-sky-400",     "dept-6":  "bg-rose-400",
  "dept-7":  "bg-orange-400",  "dept-8":  "bg-violet-400",
  "dept-9":  "bg-indigo-400",  "dept-10": "bg-emerald-400",
};

function isOverdue(dueDate: string, status: WorkOrderStatus) {
  if (status === "done" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
}

const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function statusInColumn(status: WorkOrderStatus, colKey: WorkOrderStatus) {
  return status === colKey;
}

function sortCards(cards: WorkOrder[]) {
  return [...cards].sort((a, b) => {
    const p = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
    if (p !== 0) return p;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export default function DeptWorkOrdersPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { currentUserId } = useProfile();

  const isAll = deptId === "all";
  const isMe = deptId === "me";
  const dept = departments.find((d) => d.id === deptId);
  const focusId = searchParams.get("focus");

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [filterMine, setFilterMine] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkOrder | null>(null);
  const [detailTarget, setDetailTarget] = useState<WorkOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkOrder | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<WorkOrderStatus | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = (isAll || isMe) ? "/api/work-orders" : `/api/work-orders?deptId=${deptId}`;
      const res = await fetch(url);
      const json = await res.json();
      setWorkOrders(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [deptId, isAll, isMe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deptEmployees = useMemo(
    () => (isAll || isMe) ? mockEmployees : mockEmployees.filter((e) => e.departmentId === deptId),
    [deptId, isAll, isMe]
  );

  // ในหน้า "งานของฉัน" จำกัดเฉพาะงานที่ฉันรับผิดชอบหรือเป็นคนสั่ง (ข้ามทุกแผนก)
  const scoped = useMemo(
    () => isMe
      ? workOrders.filter((w) => (w.assigneeIds ?? []).includes(currentUserId) || w.requesterId === currentUserId)
      : workOrders,
    [workOrders, isMe, currentUserId]
  );

  const filtered = useMemo(() => {
    return scoped.filter((w) => {
      const q = search.toLowerCase();
      const matchSearch = !q || w.title.toLowerCase().includes(q) || w.code.toLowerCase().includes(q) ||
        (w.assignees ?? []).some((a) => a.fullName.toLowerCase().includes(q));
      const matchPriority = filterPriority === "all" || w.priority === filterPriority;
      const matchAssignee = filterAssignee === "all" || (w.assigneeIds ?? []).includes(filterAssignee);
      const matchOverdue = !filterOverdue || isOverdue(w.dueDate, w.status);
      const matchMine = !filterMine || (w.assigneeIds ?? []).includes(currentUserId);
      return matchSearch && matchPriority && matchAssignee && matchOverdue && matchMine;
    });
  }, [scoped, search, filterPriority, filterAssignee, filterOverdue, filterMine, currentUserId]);

  // มาจาก noti (?focus=id) → scroll + highlight การ์ดเป้าหมาย
  useEffect(() => {
    if (!focusId || loading) return;
    const el = cardRefs.current[focusId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(focusId);
    const t = setTimeout(() => setHighlightId(null), 2600);
    return () => clearTimeout(t);
  }, [focusId, loading, filtered]);

  // KPI calculations
  const kpi = useMemo(() => ({
    total: scoped.length,
    backlog: scoped.filter((w) => w.status === "backlog").length,
    inProgress: scoped.filter((w) => w.status === "in_progress").length,
    done: scoped.filter((w) => w.status === "done").length,
    overdue: scoped.filter((w) => isOverdue(w.dueDate, w.status)).length,
    urgent: scoped.filter((w) => w.priority === "urgent" && w.status !== "done" && w.status !== "cancelled").length,
  }), [scoped]);

  const handleStatusChange = useCallback(async (wo: WorkOrder, status: WorkOrderStatus) => {
    const statusMsg: Record<string, string> = {
      in_progress: "เริ่มดำเนินการแล้ว",
      done: "งานเสร็จสิ้นแล้ว",
      backlog: "ย้ายกลับ Backlog แล้ว",
    };
    const res = await fetch(`/api/work-orders/${wo.id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast(statusMsg[status] ?? "อัปเดตสถานะแล้ว"); fetchData(); }
    else toast("เกิดข้อผิดพลาด", "error");
  }, [fetchData, toast]);

  const handleMove = useCallback(async (wo: WorkOrder, targetStatus: WorkOrderStatus) => {
    if (wo.status === targetStatus) return;
    await handleStatusChange(wo, targetStatus);
  }, [handleStatusChange]);

  const handleDrop = useCallback(async (targetStatus: WorkOrderStatus) => {
    if (!draggedId) { setDragOverCol(null); return; }
    const wo = workOrders.find((w) => w.id === draggedId);
    if (wo) await handleMove(wo, targetStatus);
    setDraggedId(null); setDragOverCol(null);
  }, [draggedId, workOrders, handleMove]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/work-orders/${deleteTarget.id}`, { method: "DELETE" });
      toast("ลบงานแล้ว", "info");
      fetchData();
    } finally {
      setDeleteLoading(false); setDeleteOpen(false); setDeleteTarget(null);
    }
  };

  const accentDot = dept ? (deptAccent[dept.id] ?? "bg-slate-400") : "bg-gold-500";
  const pageTitle = isAll ? "งานทั้งหมด" : isMe ? "งานของฉัน" : (dept?.name ?? "แผนก");
  const cancelledCards = filtered.filter((w) => w.status === "cancelled");

  const selectClass = "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

  return (
    <div className="flex flex-col h-full">
      <Header title={`การ์ดงาน — ${pageTitle}`} breadcrumbs={["การ์ดงาน", pageTitle]} onRefresh={fetchData} />

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Banner — ink เสมอ, ใช้สีแค่ accent dot */}
        {!isAll && (dept || isMe) && (
          <div className="px-6 py-4 flex items-center gap-4 shrink-0 bg-[#1a1a1a]">
            <button onClick={() => router.push("/work-orders")} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} /> กลับ
            </button>
            <div className="h-4 w-px bg-white/15" />
            {isMe ? (
              <div className="w-8 h-8 rounded-lg bg-gold-500/15 flex items-center justify-center text-gold-400 shrink-0">
                <UserCircle2 size={18} />
              </div>
            ) : (
              <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", accentDot)} />
            )}
            <div>
              <p className="text-white font-bold text-lg leading-tight">{pageTitle}</p>
              <p className="text-white/50 text-xs">
                {isMe ? `งานที่ฉันเกี่ยวข้อง · ${kpi.total} งาน` : `${dept?.code} · ${kpi.total} งาน`}
              </p>
            </div>
            <div className="ml-auto">
              <Button size="sm" className="bg-white/15 text-white border border-white/20 hover:bg-white/25"
                onClick={() => { setEditTarget(null); setModalOpen(true); }}>
                <Plus size={14} /> สร้างงานใหม่
              </Button>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="px-6 pt-4 shrink-0">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "ทั้งหมด",     value: kpi.total,      icon: <ClipboardList size={14} />, color: "text-slate-600", bg: "bg-slate-100" },
              { label: "Backlog",     value: kpi.backlog,    icon: <ClipboardList size={14} />, color: "text-slate-500", bg: "bg-slate-100" },
              { label: "กำลังทำ",    value: kpi.inProgress, icon: <PlayCircle size={14} />,    color: "text-gold-600",bg: "bg-gold-50" },
              { label: "เสร็จสิ้น",   value: kpi.done,       icon: <CheckCircle2 size={14} />,  color: "text-emerald-600",bg: "bg-emerald-50" },
              { label: "เกินกำหนด",  value: kpi.overdue,    icon: <AlertTriangle size={14} />, color: "text-red-600",   bg: "bg-red-50",   highlight: kpi.overdue > 0 },
              { label: "ด่วน",        value: kpi.urgent,     icon: <AlertTriangle size={14} />, color: "text-orange-600",bg: "bg-orange-50",highlight: kpi.urgent > 0 },
            ].map((c) => (
              <div key={c.label} className={cn("bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-sm flex items-center gap-2.5", c.highlight ? "border-red-200 bg-red-50/30" : "")}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", c.bg)}>
                  <span className={c.color}>{c.icon}</span>
                </div>
                <div>
                  <p className={cn("text-lg font-bold leading-tight", c.highlight ? "text-red-600" : "text-slate-900")}>{c.value}</p>
                  <p className="text-[10px] text-slate-400">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 pt-3 pb-3 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9 h-8 text-sm" placeholder="ค้นหางาน..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={selectClass} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">ทุกความสำคัญ</option>
              <option value="urgent">ด่วน</option>
              <option value="high">สูง</option>
              <option value="medium">ปกติ</option>
              <option value="low">ต่ำ</option>
            </select>
            <select className={selectClass} value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
              <option value="all">ทุกคน</option>
              {deptEmployees.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterMine((v) => !v)}
              className={cn(
                "h-9 px-3 rounded-md border text-sm font-medium transition-colors",
                filterMine
                  ? "bg-gold-600 text-white border-gold-600 hover:bg-gold-700"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              งานของฉัน
            </button>
            <button
              onClick={() => setFilterOverdue((v) => !v)}
              className={cn(
                "h-9 px-3 rounded-md border text-sm font-medium transition-colors",
                filterOverdue
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              เกินกำหนด
            </button>
            {(filterAssignee !== "all" || filterOverdue || filterPriority !== "all" || filterMine) && (
              <button
                onClick={() => { setFilterAssignee("all"); setFilterOverdue(false); setFilterPriority("all"); setFilterMine(false); }}
                className="text-xs text-gold-600 hover:text-gold-800 underline whitespace-nowrap"
              >
                ล้าง
              </button>
            )}
            {isAll && (
              <Button size="sm" onClick={() => { setEditTarget(null); setModalOpen(true); }}>
                <Plus size={14} /> สร้างงานใหม่
              </Button>
            )}
          </div>
        </div>

        {/* Kanban board */}
        {loading ? (
          <div className="flex items-center justify-center py-14 gap-2 text-slate-400 flex-1">
            <Loader2 size={18} className="animate-spin" /> กำลังโหลด...
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto px-6 pb-6">
            <div className="flex gap-4 items-stretch min-h-full" style={{ minWidth: `${COLUMNS.length * 304}px` }}>
              {COLUMNS.map((col) => {
                const cards = sortCards(filtered.filter((w) => statusInColumn(w.status, col.key)));
                const overdueInCol = cards.filter((c) => isOverdue(c.dueDate, c.status)).length;
                const isOver = dragOverCol === col.key;
                return (
                  <div
                    key={col.key}
                    className="flex flex-col w-72 shrink-0"
                    onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                    onDrop={() => handleDrop(col.key)}
                  >
                    <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-t-xl border", col.headerBg, col.borderColor)}>
                      <div className={cn("w-2 h-2 rounded-full shrink-0", col.dotColor)} />
                      <p className="font-semibold text-sm text-slate-800">{col.label}</p>
                      {overdueInCol > 0 && (
                        <span className="ml-auto text-[10px] rounded-full px-1.5 py-0.5 font-bold bg-red-100 text-red-600" title="เกินกำหนด">
                          {overdueInCol} เกิน
                        </span>
                      )}
                      <span className={cn("text-xs rounded-full px-2 py-0.5 font-bold", overdueInCol > 0 ? "" : "ml-auto", col.countBg)}>{cards.length}</span>
                      {col.key === "backlog" && (
                        <button
                          onClick={() => { setEditTarget(null); setModalOpen(true); }}
                          className="text-slate-400 hover:text-gold-600 transition-colors"
                          title="เพิ่มงานใน Backlog"
                        >
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                    <div className={cn(
                      "flex-1 flex flex-col rounded-b-xl border border-t-0 p-2 space-y-2 transition-colors min-h-[200px]",
                      col.borderColor,
                      isOver ? "bg-slate-100 ring-2 ring-gold-300 ring-inset" : "bg-slate-50/60"
                    )}>
                      {cards.length === 0 && (
                        <div className={cn(
                          "flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center px-3 transition-colors",
                          isOver ? "border-gold-400 bg-gold-50/60 text-gold-500" : "border-slate-200 text-slate-300"
                        )}>
                          <ClipboardList size={22} className="opacity-60" />
                          <p className="text-[11px] leading-tight font-medium">
                            {isOver ? "วางที่นี่" : "ลากการ์ดงานมาวางที่นี่"}
                          </p>
                        </div>
                      )}
                      {cards.map((wo) => (
                        <div
                          key={wo.id}
                          ref={(el) => { cardRefs.current[wo.id] = el; }}
                          draggable
                          onDragStart={(e) => { setDraggedId(wo.id); e.dataTransfer.effectAllowed = "move"; }}
                          onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                          className={cn(
                            "cursor-grab active:cursor-grabbing transition-all rounded-xl",
                            draggedId === wo.id && "opacity-40",
                            highlightId === wo.id && "ring-2 ring-gold-500 ring-offset-2"
                          )}
                        >
                          <WorkOrderCard
                            wo={wo}
                            onView={(w) => setDetailTarget(w)}
                            onEdit={(w) => { setEditTarget(w); setModalOpen(true); }}
                            onDelete={(w) => { setDeleteTarget(w); setDeleteOpen(true); }}
                            onStatusChange={handleStatusChange}
                            onMove={handleMove}
                            isMine={(wo.assigneeIds ?? []).includes(currentUserId)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancelled section */}
            {cancelledCards.length > 0 && (
              <div className="mt-4">
                <button onClick={() => setShowRejected(!showRejected)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-2">
                  <ChevronDown size={14} className={cn("transition-transform", showRejected && "rotate-180")} />
                  ยกเลิก ({cancelledCards.length})
                </button>
                {showRejected && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {cancelledCards.map((wo) => (
                      <WorkOrderCard key={wo.id} wo={wo}
                        onView={(w) => setDetailTarget(w)}
                        onEdit={(w) => { setEditTarget(w); setModalOpen(true); }}
                        onDelete={(w) => { setDeleteTarget(w); setDeleteOpen(true); }}
                        onStatusChange={handleStatusChange}
                        onMove={handleMove}
                        isMine={(wo.assigneeIds ?? []).includes(currentUserId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkOrderModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditTarget(null); }}
        workOrder={editTarget}
        defaultDeptId={isAll ? undefined : deptId}
        onSuccess={() => { fetchData(); toast(editTarget ? "แก้ไขงานแล้ว" : "สร้างงานใหม่แล้ว"); }}
      />

      {detailTarget && (
        <WorkOrderDetailModal
          workOrder={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(w) => { setDetailTarget(null); setEditTarget(w); setModalOpen(true); }}
        />
      )}

      <DeleteConfirmModal
        open={deleteOpen}
        position={deleteTarget ? { ...deleteTarget, code: deleteTarget.code, name: deleteTarget.title } as unknown as Position : null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        loading={deleteLoading}
      />
    </div>
  );
}
