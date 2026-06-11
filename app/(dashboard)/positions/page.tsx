"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileDown,
  SlidersHorizontal,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SummaryCards } from "@/components/hr/SummaryCards";
import { PositionCard } from "@/components/hr/PositionCard";
import { PositionModal } from "@/components/hr/PositionModal";
import { DeleteConfirmModal } from "@/components/hr/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Department, Branch, Position, SummaryStats } from "@/types";
import { jobLevels } from "@/lib/mock-db";

const selectClass =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-transparent";

export default function PositionsPage() {
  const toast = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<SummaryStats>({
    totalPositions: 0,
    totalDepartments: 0,
    recruitingPositions: 0,
    totalEmployees: 0,
    totalBranches: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View detail modal
  const [viewTarget, setViewTarget] = useState<Position | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [posRes, deptRes, branchRes] = await Promise.all([
        fetch("/api/positions"),
        fetch("/api/departments"),
        fetch("/api/branches"),
      ]);
      const [posJson, deptJson, branchJson] = await Promise.all([
        posRes.json(),
        deptRes.json(),
        branchRes.json(),
      ]);
      setPositions(posJson.data ?? []);
      setStats(posJson.stats ?? stats);
      setDepartments(deptJson.data ?? []);
      setBranches(branchJson.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.department.name.toLowerCase().includes(q);
      const matchDept = filterDept === "all" || p.departmentId === filterDept;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchBranch = filterBranch === "all" || p.branchId === filterBranch;
      return matchSearch && matchDept && matchStatus && matchBranch;
    });
  }, [positions, search, filterDept, filterStatus, filterBranch]);

  const handleAddSuccess = (position: Position) => {
    setPositions((prev) => {
      const exists = prev.find((p) => p.id === position.id);
      if (exists) return prev.map((p) => (p.id === position.id ? position : p));
      return [...prev, position];
    });
    setStats((prev) => ({
      ...prev,
      totalPositions: positions.length + (editTarget ? 0 : 1),
      recruitingPositions: positions.filter((p) => p.status === "recruiting").length,
    }));
    fetchData();
  };

  const handleEdit = (p: Position) => {
    setEditTarget(p);
    setModalOpen(true);
  };

  const handleView = (p: Position) => {
    setViewTarget(p);
    setViewOpen(true);
  };

  const handleDeleteClick = (p: Position) => {
    setDeleteTarget(p);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/positions/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        fetchData();
      } else {
        const json = await res.json();
        toast(json.error ?? "ลบไม่สำเร็จ", "error");
      }
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    toast("Export (mock) — ระบบ Excel/PDF จะพร้อมในเวอร์ชันถัดไป", "info");
  };

  const activeFiltersCount = [
    filterDept !== "all",
    filterStatus !== "all",
    filterBranch !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="ตำแหน่งงาน"
        breadcrumbs={["ตำแหน่งงาน"]}
        onRefresh={fetchData}
        onExport={handleExport}
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Summary Cards */}
        <SummaryCards stats={stats} />

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="pl-9"
                placeholder="ค้นหาตำแหน่ง รหัส หรือแผนก..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className={selectClass}
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="all">ทุกแผนก</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                className={selectClass}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">ทำงานอยู่</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="recruiting">กำลังรับสมัคร</option>
              </select>

              <select
                className={selectClass}
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="all">ทุกสาขา</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {activeFiltersCount > 0 && (
                <button
                  className="text-xs text-gold-600 hover:text-gold-800 underline"
                  onClick={() => {
                    setFilterDept("all");
                    setFilterStatus("all");
                    setFilterBranch("all");
                  }}
                >
                  ล้างตัวกรอง ({activeFiltersCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileSpreadsheet size={14} />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown size={14} />
                PDF
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditTarget(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={14} />
                เพิ่มตำแหน่ง
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? (
              "กำลังโหลด..."
            ) : (
              <>
                แสดง <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
                จาก {positions.length} ตำแหน่ง
              </>
            )}
          </p>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gold-600">
              <SlidersHorizontal size={12} />
              <span>กรองอยู่ {activeFiltersCount} เงื่อนไข</span>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Search size={26} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">ไม่พบตำแหน่งที่ตรงกับเงื่อนไข</p>
            <button
              className="text-xs text-gold-600 underline hover:text-gold-800"
              onClick={() => {
                setSearch("");
                setFilterDept("all");
                setFilterStatus("all");
                setFilterBranch("all");
              }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
            {filtered.map((p) => (
              <PositionCard
                key={p.id}
                position={p}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Position Modal (Add / Edit) */}
      <PositionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTarget(null);
        }}
        position={editTarget}
        departments={departments}
        branches={branches}
        jobLevels={jobLevels}
        onSuccess={handleAddSuccess}
      />

      {/* View Detail Modal */}
      {viewOpen && viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-500 to-blue-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-mono">{viewTarget.code}</p>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{viewTarget.name}</h2>
                </div>
                <button
                  onClick={() => setViewOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "แผนก", value: viewTarget.department.name },
                  { label: "ระดับงาน", value: viewTarget.jobLevel.name },
                  { label: "สาขา", value: viewTarget.branch.name },
                  {
                    label: "สถานะ",
                    value:
                      viewTarget.status === "active"
                        ? "ทำงานอยู่"
                        : viewTarget.status === "recruiting"
                        ? "กำลังรับสมัคร"
                        : "ไม่ใช้งาน",
                  },
                  {
                    label: "ช่วงเงินเดือน",
                    value: `฿${viewTarget.salaryMin.toLocaleString()} – ฿${viewTarget.salaryMax.toLocaleString()}`,
                  },
                  { label: "พนักงาน", value: `${viewTarget.employeeCount} คน` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p className="font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              {viewTarget.description && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">รายละเอียดงาน</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                    {viewTarget.description}
                  </p>
                </div>
              )}
              {viewTarget.requirements && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">คุณสมบัติ</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                    {viewTarget.requirements}
                  </p>
                </div>
              )}
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewOpen(false)}
                >
                  ปิด
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setViewOpen(false);
                    handleEdit(viewTarget);
                  }}
                >
                  แก้ไข
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        position={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}
