"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users, UserCheck, UserX, Clock, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmployeeCard } from "@/components/hr/EmployeeCard";
import { EmployeeDetailModal } from "@/components/hr/EmployeeDetailModal";
import { EmployeeFormModal } from "@/components/hr/EmployeeFormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { departments, branches } from "@/lib/mock-db";
import type { MockEmployee } from "@/lib/mock-employees";

function computeStats(list: MockEmployee[]) {
  return {
    total: list.length,
    active: list.filter((e) => e.status === "active").length,
    inactive: list.filter((e) => e.status === "inactive").length,
    on_leave: list.filter((e) => e.status === "on_leave").length,
  };
}

const selectClass =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-transparent";

interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
}

export default function EmployeesPage() {
  const toast = useToast();
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({ total: 0, active: 0, inactive: 0, on_leave: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [viewTarget, setViewTarget] = useState<MockEmployee | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MockEmployee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockEmployee | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const json = await res.json();
      const list: MockEmployee[] = json.data ?? [];
      setEmployees(list);
      setStats(json.stats ?? computeStats(list));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = (emp: MockEmployee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === emp.id);
      const next = exists ? prev.map((e) => (e.id === emp.id ? emp : e)) : [emp, ...prev];
      setStats(computeStats(next));
      return next;
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEmployees((prev) => {
      const next = prev.filter((e) => e.id !== deleteTarget.id);
      setStats(computeStats(next));
      return next;
    });
    toast("ลบพนักงานแล้ว", "info");
    setDeleteTarget(null);
    setViewOpen(false);
    setViewTarget(null);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.positionName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchDept = filterDept === "all" || e.departmentId === filterDept;
      const matchBranch = filterBranch === "all" || e.branchId === filterBranch;
      const matchStatus = filterStatus === "all" || e.status === filterStatus;
      return matchSearch && matchDept && matchBranch && matchStatus;
    });
  }, [employees, search, filterDept, filterBranch, filterStatus]);

  const handleView = (e: MockEmployee) => {
    setViewTarget(e);
    setViewOpen(true);
  };

  const activeFiltersCount = [
    filterDept !== "all",
    filterBranch !== "all",
    filterStatus !== "all",
  ].filter(Boolean).length;

  const kpiCards = [
    { label: "พนักงานทั้งหมด", value: stats.total,    icon: <Users size={18} />,     color: "text-gold-600",  bg: "bg-gold-50" },
    { label: "ทำงานอยู่",     value: stats.active,   icon: <UserCheck size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "ลาพัก",         value: stats.on_leave, icon: <Clock size={18} />,     color: "text-amber-600",   bg: "bg-amber-50" },
    { label: "ไม่ใช้งาน",     value: stats.inactive, icon: <UserX size={18} />,     color: "text-slate-500",   bg: "bg-slate-100" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="พนักงาน" breadcrumbs={["พนักงาน"]} onRefresh={fetchData} />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className={cn("w-9 h-9 rounded-lg mb-3 flex items-center justify-center", c.bg)}>
                <span className={c.color}>{c.icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="ค้นหาชื่อ รหัส ตำแหน่ง หรืออีเมล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select className={selectClass} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="all">ทุกแผนก</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select className={selectClass} value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                <option value="all">ทุกสาขา</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select className={selectClass} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">ทุกสถานะ</option>
                <option value="active">ทำงานอยู่</option>
                <option value="on_leave">ลาพัก</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>

              {activeFiltersCount > 0 && (
                <button
                  className="text-xs text-gold-600 hover:text-gold-800 underline"
                  onClick={() => { setFilterDept("all"); setFilterBranch("all"); setFilterStatus("all"); }}
                >
                  ล้างตัวกรอง ({activeFiltersCount})
                </button>
              )}
            </div>

            <Button size="sm" className="ml-auto" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
              <Plus size={14} /> เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500">
          {loading ? "กำลังโหลด..." : (
            <>แสดง <span className="font-semibold text-slate-800">{filtered.length}</span> จาก {employees.length} คน</>
          )}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Search size={26} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">ไม่พบพนักงานที่ตรงกับเงื่อนไข</p>
            <button
              className="text-xs text-gold-600 underline hover:text-gold-800"
              onClick={() => { setSearch(""); setFilterDept("all"); setFilterBranch("all"); setFilterStatus("all"); }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
            {filtered.map((e) => (
              <EmployeeCard key={e.id} employee={e} onView={handleView} />
            ))}
          </div>
        )}
      </div>

      <EmployeeDetailModal
        employee={viewTarget}
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewTarget(null); }}
        onEdit={(e) => { setViewOpen(false); setEditTarget(e); setFormOpen(true); }}
        onDelete={(e) => setDeleteTarget(e)}
      />

      <EmployeeFormModal
        open={formOpen}
        employee={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-500 mt-1">
              ลบ &ldquo;{deleteTarget.fullName}&rdquo; ออกจากระบบ? การกระทำนี้ย้อนกลับไม่ได้
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete}>ลบ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
