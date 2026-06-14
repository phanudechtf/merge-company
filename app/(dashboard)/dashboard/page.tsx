"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, ClipboardList, AlertTriangle,
  Timer, CheckCircle2, ChevronRight, Plus, ArrowUpRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/components/layout/ProfileContext";
import { departments } from "@/lib/mock-db";
import { mockEmployees } from "@/lib/mock-employees";
import { cn, formatDate } from "@/lib/utils";
import type { WorkOrder } from "@/lib/mock-work-orders";
import type { SummaryStats } from "@/types";

const deptColors: Record<string, string> = {
  "dept-1": "bg-slate-500", "dept-2": "bg-gold-500",
  "dept-3": "bg-teal-500",  "dept-4": "bg-amber-500",
  "dept-5": "bg-blue-500",  "dept-6": "bg-pink-500",
  "dept-7": "bg-orange-500","dept-8": "bg-fuchsia-500",
  "dept-9": "bg-purple-500","dept-10": "bg-emerald-500",
};

function isOverdue(dueDate: string, status: string) {
  if (["done","cancelled"].includes(status)) return false;
  return new Date(dueDate) < new Date();
}

const statusLabel: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" }> = {
  backlog:     { label: "Backlog",   variant: "outline" },
  in_progress: { label: "กำลังทำ",   variant: "default" },
  done:        { label: "เสร็จ",     variant: "success" },
  cancelled:   { label: "ยกเลิก",    variant: "outline" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { name } = useProfile();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [posStats, setPosStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/work-orders").then((r) => r.json()),
      fetch("/api/positions").then((r) => r.json()),
    ]).then(([wo, pos]) => {
      setWorkOrders(wo.data ?? []);
      setPosStats(pos.stats ?? null);
    }).finally(() => setLoading(false));
  }, []);

  const activeWO = workOrders.filter((w) => !["done","cancelled"].includes(w.status));
  const overdueWO = workOrders.filter((w) => isOverdue(w.dueDate, w.status));
  const backlogWO = workOrders.filter((w) => w.status === "backlog");
  const recentWO = [...workOrders].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const deptStats = departments.map((d) => {
    const dWO = workOrders.filter((w) => w.assigneeDeptId === d.id);
    return { dept: d, total: dWO.length, active: dWO.filter((w) => w.status === "in_progress").length };
  }).filter((d) => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 6);

  const maxDeptTotal = Math.max(...deptStats.map((d) => d.total), 1);

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" breadcrumbs={["Dashboard"]} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ยินดีต้อนรับ, {name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">SENSE ASIA CORPORATION · MERGE Workspace</p>
          </div>
          <Button onClick={() => router.push("/work-orders")} size="sm">
            <Plus size={14} /> สร้างงานใหม่
          </Button>
        </div>

        {/* Top KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "พนักงานทั้งหมด", value: mockEmployees.length,
              icon: <Users size={18} />, color: "text-gold-600", bg: "bg-gold-50",
              sub: `${departments.length} แผนก`, onClick: () => router.push("/employees"),
            },
            {
              label: "ตำแหน่งงาน", value: posStats?.totalPositions ?? "—",
              icon: <Briefcase size={18} />, color: "text-blue-600", bg: "bg-blue-50",
              sub: `${posStats?.recruitingPositions ?? 0} กำลังรับสมัคร`, onClick: () => router.push("/positions"),
            },
            {
              label: "งาน Active", value: activeWO.length,
              icon: <ClipboardList size={18} />, color: "text-teal-600", bg: "bg-teal-50",
              sub: `${backlogWO.length} ใน Backlog`, onClick: () => router.push("/work-orders"),
            },
            {
              label: "เกินกำหนด", value: overdueWO.length,
              icon: <AlertTriangle size={18} />, color: overdueWO.length > 0 ? "text-red-600" : "text-slate-400",
              bg: overdueWO.length > 0 ? "bg-red-50" : "bg-slate-100",
              sub: overdueWO.length > 0 ? "ต้องดำเนินการด่วน" : "ทุกงานอยู่ในเวลา",
              highlight: overdueWO.length > 0,
              onClick: () => router.push("/work-orders/all"),
            },
          ].map((c) => (
            <button
              key={c.label}
              onClick={c.onClick}
              className={cn(
                "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left",
                c.highlight && "border-red-200 bg-red-50/30"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", c.bg)}>
                <span className={c.color}>{c.icon}</span>
              </div>
              <p className={cn("text-2xl font-bold", c.highlight ? "text-red-600" : "text-slate-900")}>{c.value}</p>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{c.label}</p>
              <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Work Orders by dept */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">งานตามแผนก</h2>
                <p className="text-xs text-slate-400 mt-0.5">จำนวนงานที่รับผิดชอบแต่ละแผนก</p>
              </div>
              <button onClick={() => router.push("/work-orders")} className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ดูทั้งหมด <ArrowUpRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}</div>
            ) : deptStats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">ยังไม่มีงาน</p>
            ) : (
              <div className="space-y-3">
                {deptStats.map(({ dept, total, active }) => (
                  <button
                    key={dept.id}
                    onClick={() => router.push(`/work-orders/${dept.id}`)}
                    className="w-full flex items-center gap-3 hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors group"
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", deptColors[dept.id] ?? "bg-slate-400")} />
                    <p className="text-sm font-medium text-slate-700 w-32 text-left truncate">{dept.name}</p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", deptColors[dept.id] ?? "bg-slate-400")}
                        style={{ width: `${(total / maxDeptTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-6 text-right">{total}</span>
                    {active > 0 && (
                      <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                        {active} ทำอยู่
                      </span>
                    )}
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-gold-500 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent work orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">งานล่าสุด</h2>
                <p className="text-xs text-slate-400 mt-0.5">อัปเดตล่าสุด</p>
              </div>
              <button onClick={() => router.push("/work-orders/all")} className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ดูทั้งหมด <ArrowUpRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : recentWO.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">ยังไม่มีงาน</p>
            ) : (
              <div className="space-y-2">
                {recentWO.map((wo) => {
                  const overdue = isOverdue(wo.dueDate, wo.status);
                  const st = statusLabel[wo.status] ?? { label: wo.status, variant: "outline" as const };
                  return (
                    <button
                      key={wo.id}
                      onClick={() => router.push(`/work-orders/${wo.assigneeDeptId}`)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", {
                        "bg-amber-400": wo.priority === "urgent",
                        "bg-orange-400": wo.priority === "high",
                        "bg-blue-400": wo.priority === "medium",
                        "bg-emerald-400": wo.priority === "low",
                      })} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{wo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={st.variant} className="text-[10px] py-0">{st.label}</Badge>
                          {overdue && <span className="text-[10px] text-red-500 font-medium">เกินกำหนด</span>}
                          <span className="text-[10px] text-slate-400 ml-auto">{formatDate(wo.dueDate)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Work order status summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">ภาพรวมสถานะงาน</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "backlog",     label: "Backlog",   color: "bg-slate-400", textColor: "text-slate-700" },
              { key: "in_progress", label: "กำลังทำ",   color: "bg-gold-500",textColor: "text-gold-700" },
              { key: "done",        label: "เสร็จสิ้น", color: "bg-emerald-500",textColor: "text-emerald-700" },
              { key: "cancelled",   label: "ยกเลิก",    color: "bg-red-400",   textColor: "text-red-700" },
            ].map((s) => {
              const count = workOrders.filter((w) => w.status === s.key).length;
              const pct = workOrders.length > 0 ? Math.round((count / workOrders.length) * 100) : 0;
              return (
                <div key={s.key} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full", s.color)} />
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                  <p className={cn("text-2xl font-bold", s.textColor)}>{count}</p>
                  <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
          {[
            { label: "การ์ดงาน", sub: "สร้างและติดตามงาน", icon: <ClipboardList size={20} />, href: "/work-orders", color: "text-gold-600", bg: "bg-gold-50" },
            { label: "ตำแหน่งงาน", sub: "จัดการตำแหน่ง", icon: <Briefcase size={20} />, href: "/positions", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "งาน Backlog", sub: `${backlogWO.length} งานค้าง`, icon: <Timer size={20} />, href: "/work-orders/all", color: "text-amber-600", bg: "bg-amber-50" },
            { label: "งานเสร็จแล้ว", sub: `${workOrders.filter((w) => w.status === "done").length} งาน`, icon: <CheckCircle2 size={20} />, href: "/work-orders/all", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((q) => (
            <button
              key={q.label}
              onClick={() => router.push(q.href)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-center gap-4"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", q.bg)}>
                <span className={q.color}>{q.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{q.label}</p>
                <p className="text-xs text-slate-400">{q.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
