"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, PlayCircle, CheckCircle2, Plus, Archive, UserCircle2, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WorkOrderModal } from "@/components/hr/WorkOrderModal";
import { useToast } from "@/components/ui/toast";
import { useProfile } from "@/components/layout/ProfileContext";
import { departments } from "@/lib/mock-db";
import type { WorkOrder } from "@/lib/mock-work-orders";
import { cn } from "@/lib/utils";

// จุด accent ต่อแผนก — แค่สีเล็ก (dot + แถบบน) คุมโทนรวมเป็น ink/ขาว
const deptAccent: Record<string, string> = {
  "dept-1":  "bg-slate-700",   "dept-2":  "bg-gold-500",
  "dept-3":  "bg-teal-600",    "dept-4":  "bg-amber-500",
  "dept-5":  "bg-sky-600",     "dept-6":  "bg-rose-500",
  "dept-7":  "bg-orange-500",  "dept-8":  "bg-violet-500",
  "dept-9":  "bg-indigo-500",  "dept-10": "bg-emerald-600",
};

interface DeptStats {
  total: number;
  backlog: number;
  inProgress: number;
  done: number;
}

export default function WorkOrdersLandingPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUserId } = useProfile();
  const [allWorkOrders, setAllWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/work-orders")
      .then((r) => r.json())
      .then((json) => setAllWorkOrders(json.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  function getDeptStats(deptId: string): DeptStats {
    const deptOrders = allWorkOrders.filter((w) => w.assigneeDeptId === deptId);
    return {
      total: deptOrders.length,
      backlog: deptOrders.filter((w) => w.status === "backlog").length,
      inProgress: deptOrders.filter((w) => w.status === "in_progress").length,
      done: deptOrders.filter((w) => w.status === "done").length,
    };
  }

  const totalAll = allWorkOrders.length;
  const totalBacklog = allWorkOrders.filter((w) => w.status === "backlog").length;
  const totalInProgress = allWorkOrders.filter((w) => w.status === "in_progress").length;
  const totalDone = allWorkOrders.filter((w) => w.status === "done").length;

  // งานที่เกี่ยวกับฉัน (รับผิดชอบ หรือ เป็นคนสั่ง) ข้ามทุกแผนก
  const myCount = allWorkOrders.filter(
    (w) => (w.assigneeIds ?? []).includes(currentUserId) || w.requesterId === currentUserId
  ).length;

  return (
    <div className="flex flex-col h-full">
      <Header title="การ์ดงาน" breadcrumbs={["การ์ดงาน"]} onRefresh={fetchData} />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "งานทั้งหมด",     value: totalAll,        icon: <ClipboardList size={18} />, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Backlog",        value: totalBacklog,    icon: <Archive size={18} />,       color: "text-slate-500", bg: "bg-slate-100" },
            { label: "กำลังดำเนินการ", value: totalInProgress, icon: <PlayCircle size={18} />,   color: "text-gold-600", bg: "bg-gold-50" },
            { label: "เสร็จสิ้น",      value: totalDone,       icon: <CheckCircle2 size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className={cn("w-9 h-9 rounded-lg mb-3 flex items-center justify-center", c.bg)}>
                <span className={c.color}>{c.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions: งานของฉัน + สร้างงาน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/work-orders/me")}
            className="md:col-span-2 group relative overflow-hidden bg-[#1a1a1a] rounded-2xl p-5 text-left shadow-sm hover:shadow-lg transition-all"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gold-500/10" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400 shrink-0">
                <UserCircle2 size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base">งานของฉัน</p>
                <p className="text-slate-400 text-xs mt-0.5">งานที่ฉันรับผิดชอบหรือเป็นคนสั่ง — รวมทุกแผนก</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-2xl font-bold text-gold-400">{myCount}</span>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="group bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-gold-400 hover:bg-gold-50/30 transition-all flex items-center justify-center gap-3 p-5 shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 group-hover:bg-gold-100 transition-colors">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800 group-hover:text-gold-700 transition-colors">สร้างงานใหม่</p>
              <p className="text-xs text-slate-400">เลือกแผนกปลายทางในฟอร์ม</p>
            </div>
          </button>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">เลือกแผนก</h2>
            <p className="text-xs text-slate-400 mt-0.5">คลิกแผนกเพื่อดูและจัดการงานของทีมนั้น</p>
          </div>
          <button onClick={() => router.push("/work-orders/all")} className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-800 transition-colors">
            ดูงานทั้งหมด <ChevronRight size={14} />
          </button>
        </div>

        {/* Department grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6 auto-rows-fr">
            {departments.map((dept) => {
              const accent = deptAccent[dept.id] ?? "bg-slate-500";
              const stats = getDeptStats(dept.id);

              return (
                <button
                  key={dept.id}
                  onClick={() => router.push(`/work-orders/${dept.id}`)}
                  className="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-gold-300 transition-all duration-200 overflow-hidden text-left"
                >
                  {/* accent bar */}
                  <div className={cn("h-1 w-full", accent)} />

                  <div className="p-4 flex flex-col flex-1">
                    {/* header: dot + name */}
                    <div className="flex items-center gap-2.5">
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", accent)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-bold text-sm leading-tight truncate">{dept.name}</p>
                        <p className="text-slate-400 text-[10px] font-mono">{dept.code}</p>
                      </div>
                      {stats.backlog > 0 && (
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {stats.backlog} ค้าง
                        </span>
                      )}
                    </div>

                    {/* stats */}
                    <div className="mt-4 flex-1 flex flex-col justify-end">
                      {stats.total === 0 ? (
                        <p className="text-xs text-slate-300 text-center py-4">ยังไม่มีงาน</p>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">งานทั้งหมด</span>
                            <span className="font-bold text-slate-800">{stats.total}</span>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {stats.inProgress > 0 && (
                              <span className="flex items-center gap-1 text-[10px] bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full">
                                <PlayCircle size={10} /> {stats.inProgress} กำลังทำ
                              </span>
                            )}
                            {stats.done > 0 && (
                              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} /> {stats.done} เสร็จ
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all"
                              style={{ width: `${Math.round((stats.done / stats.total) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-xs text-slate-400">เข้าดูงาน</span>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <WorkOrderModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        workOrder={null}
        onSuccess={() => { fetchData(); toast("สร้างงานใหม่แล้ว"); }}
      />
    </div>
  );
}
