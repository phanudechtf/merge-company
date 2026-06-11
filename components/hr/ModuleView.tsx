"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Download, X, SlidersHorizontal, Pencil, Trash2,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { moduleConfigs, type Row, type ColumnDef, type Kpi } from "@/lib/module-configs";

type InternalRow = Row & { __id: string };

const PAGE_SIZE = 8;

const toneMap: Record<NonNullable<Kpi["tone"]>, { text: string; dot: string }> = {
  violet:  { text: "text-gold-600",  dot: "bg-gold-500" },
  emerald: { text: "text-emerald-600", dot: "bg-emerald-500" },
  amber:   { text: "text-amber-600",   dot: "bg-amber-500" },
  blue:    { text: "text-blue-600",    dot: "bg-blue-500" },
  red:     { text: "text-red-600",     dot: "bg-red-500" },
  slate:   { text: "text-slate-600",   dot: "bg-slate-400" },
};

const selectClass =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-transparent";
const formSelectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

function renderCell(col: ColumnDef, value: string | number, badgeMap?: Record<string, string>) {
  if (value === undefined || value === null || value === "") return <span className="text-slate-300">—</span>;
  switch (col.type) {
    case "badge":
      return <Badge variant={(badgeMap?.[String(value)] as never) ?? "default"}>{value}</Badge>;
    case "currency":
      return <span className="font-medium tabular-nums">฿{formatCurrency(Number(value))}</span>;
    case "date":
      return <span className="text-slate-600">{formatDate(String(value))}</span>;
    case "number":
      return <span className="tabular-nums">{value}</span>;
    default:
      return <span>{value}</span>;
  }
}

let __counter = 0;
function makeId() {
  __counter += 1;
  return `row-${__counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ModuleView({ moduleKey }: { moduleKey: string }) {
  const cfg = moduleConfigs[moduleKey];
  const toast = useToast();
  const wf = cfg.workflow;

  const [rows, setRows] = useState<InternalRow[]>(() => cfg.rows.map((r) => ({ ...r, __id: makeId() })));
  const storageKey = `merge-module-v1-${moduleKey}`;
  const [hydrated, setHydrated] = useState(false);

  // load saved rows after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as InternalRow[];
        if (Array.isArray(parsed) && parsed.length >= 0) setRows(parsed);
      }
    } catch {
      // corrupt/unavailable storage — keep seed rows
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // persist on change (only after hydration so the seed write doesn't clobber saved data)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
      // storage full/unavailable — non-fatal
    }
  }, [rows, hydrated, storageKey]);

  const [search, setSearch] = useState("");
  const [filterVals, setFilterVals] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<InternalRow | null>(null);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<InternalRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const optionsFor = (key: string) =>
    Array.from(new Set(cfg.rows.map((r) => String(r[key])))).filter(Boolean);

  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    for (const f of cfg.filters ?? []) opts[f.key] = optionsFor(f.key);
    return opts;
  }, [cfg]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || cfg.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
      const matchFilters = (cfg.filters ?? []).every((f) => {
        const v = filterVals[f.key];
        return !v || v === "all" || String(r[f.key]) === v;
      });
      return matchSearch && matchFilters;
    });
  }, [rows, search, filterVals, cfg]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = cfg.columns.find((c) => c.key === sortKey);
    const numeric = col?.type === "number" || col?.type === "currency";
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      let cmp: number;
      if (numeric) cmp = (Number(av) || 0) - (Number(bv) || 0);
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, cfg.columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const kpis = cfg.kpis?.(rows) ?? [];
  const activeFilters = Object.values(filterVals).filter((v) => v && v !== "all").length;

  const resetPage = () => setPage(1);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // selection
  const pagedIds = paged.map((r) => r.__id);
  const allPagedSelected = pagedIds.length > 0 && pagedIds.every((id) => selected.has(id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPagedSelected) pagedIds.forEach((id) => next.delete(id));
      else pagedIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAdd = () => {
    const init: Record<string, string> = {};
    for (const c of cfg.columns) init[c.key] = c.type === "badge" ? optionsFor(c.key)[0] ?? "" : "";
    setForm(init); setEditId(null); setFormOpen(true);
  };
  const openEdit = (row: InternalRow) => {
    const init: Record<string, string> = {};
    for (const c of cfg.columns) init[c.key] = String(row[c.key] ?? "");
    setForm(init); setEditId(row.__id); setFormOpen(true); setDetail(null);
  };

  const submitForm = () => {
    const keyCol = cfg.columns[0];
    if (!form[keyCol.key]?.trim()) { toast(`กรุณาใส่${keyCol.label}`, "error"); return; }
    const built: Row = {};
    for (const c of cfg.columns) {
      const raw = form[c.key] ?? "";
      built[c.key] = c.type === "number" || c.type === "currency" ? Number(raw) || 0 : raw;
    }
    if (editId) {
      setRows((prev) => prev.map((r) => (r.__id === editId ? { ...r, ...built } : r)));
      toast("บันทึกการแก้ไขแล้ว");
    } else {
      setRows((prev) => [{ ...built, __id: makeId() }, ...prev]);
      toast(`เพิ่ม${cfg.title}แล้ว`);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.__id !== deleteTarget.__id));
    setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget.__id); return n; });
    toast("ลบรายการแล้ว", "info");
    setDeleteTarget(null); setDetail(null);
  };

  const confirmBulkDelete = () => {
    setRows((prev) => prev.filter((r) => !selected.has(r.__id)));
    toast(`ลบ ${selected.size} รายการแล้ว`, "info");
    setSelected(new Set());
    setBulkDeleteOpen(false);
  };

  const applyWorkflow = (row: InternalRow, value: string, label: string) => {
    if (!wf) return;
    setRows((prev) => prev.map((r) => (r.__id === row.__id ? { ...r, [wf.statusKey]: value } : r)));
    toast(label, value === wf.reject ? "warning" : "success");
    setDetail(null);
  };

  const exportCsv = () => {
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = cfg.columns.map((c) => c.label);
    const body = sorted.map((r) => cfg.columns.map((c) => esc(r[c.key])).join(","));
    const csv = "﻿" + [headers.join(","), ...body].join("\n"); // BOM for Excel/Thai
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `merge-${moduleKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(`Export ${sorted.length} รายการเป็น CSV แล้ว`);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={cfg.title}
        breadcrumbs={cfg.breadcrumbs}
        onExport={exportCsv}
      />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* KPIs */}
        {kpis.length > 0 && (
          <div className={cn("grid gap-4 grid-cols-2", kpis.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
            {kpis.map((k) => {
              const tone = toneMap[k.tone ?? "slate"];
              return (
                <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className={cn("w-2 h-2 rounded-full mb-3", tone.dot)} />
                  <p className={cn("text-2xl font-bold", tone.text)}>{k.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} />
            </div>

            {(cfg.filters ?? []).map((f) => (
              <select
                key={f.key}
                className={selectClass}
                value={filterVals[f.key] ?? "all"}
                onChange={(e) => { setFilterVals((prev) => ({ ...prev, [f.key]: e.target.value })); resetPage(); }}
              >
                <option value="all">ทุก{f.label}</option>
                {filterOptions[f.key]?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ))}

            {activeFilters > 0 && (
              <button className="text-xs text-gold-600 hover:text-gold-800 underline" onClick={() => { setFilterVals({}); resetPage(); }}>
                ล้างตัวกรอง ({activeFilters})
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download size={14} /> Export
              </Button>
              {cfg.addLabel && (
                <Button size="sm" onClick={openAdd}>
                  <Plus size={14} /> {cfg.addLabel}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Result count + bulk bar */}
        <div className="flex items-center justify-between">
          {selected.size > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">เลือก {selected.size} รายการ</span>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 h-7" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 size={13} /> ลบที่เลือก
              </Button>
              <button className="text-xs text-slate-500 hover:text-slate-700 underline" onClick={() => setSelected(new Set())}>
                ยกเลิกการเลือก
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              แสดง <span className="font-semibold text-slate-800">{sorted.length}</span> จาก {rows.length} รายการ
            </p>
          )}
          {activeFilters > 0 && selected.size === 0 && (
            <div className="flex items-center gap-1 text-xs text-gold-600">
              <SlidersHorizontal size={12} /> <span>กรองอยู่ {activeFilters} เงื่อนไข</span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPagedSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                    />
                  </th>
                  {cfg.columns.map((c) => {
                    const active = sortKey === c.key;
                    return (
                      <th key={c.key} className="text-left font-semibold text-slate-600 px-4 py-3 whitespace-nowrap">
                        <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-900 group">
                          {c.label}
                          {active ? (
                            sortDir === "asc" ? <ChevronUp size={13} className="text-gold-600" /> : <ChevronDown size={13} className="text-gold-600" />
                          ) : (
                            <ChevronsUpDown size={13} className="text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="w-28 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={cfg.columns.length + 2} className="px-4 py-12 text-center text-slate-400">
                      ไม่พบรายการที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  paged.map((row) => {
                    const isPending = wf && String(row[wf.statusKey]) === wf.pending;
                    return (
                      <tr
                        key={row.__id}
                        onClick={() => setDetail(row)}
                        className={cn(
                          "group border-b border-slate-100 last:border-0 hover:bg-gold-50/30 cursor-pointer transition-colors",
                          selected.has(row.__id) && "bg-gold-50/50"
                        )}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(row.__id)}
                            onChange={() => toggleSelect(row.__id)}
                            className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                          />
                        </td>
                        {cfg.columns.map((c, ci) => (
                          <td key={c.key} className={cn("px-4 py-3 whitespace-nowrap", ci === 0 ? "font-medium text-slate-800" : "text-slate-600")}>
                            {renderCell(c, row[c.key], cfg.badgeMap)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            {isPending && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); applyWorkflow(row, wf!.approve, "อนุมัติแล้ว"); }} className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" title="อนุมัติ">
                                  <CheckCircle2 size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); applyWorkflow(row, wf!.reject, "ปฏิเสธแล้ว"); }} className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50" title="ปฏิเสธ">
                                  <XCircle size={14} />
                                </button>
                                <span className="w-px h-4 bg-slate-200 mx-0.5" />
                              </>
                            )}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="แก้ไข">
                                <Pencil size={13} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50" title="ลบ">
                                <Trash2 size={13} />
                              </button>
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sorted.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/30">
              <p className="text-xs text-slate-400">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} จาก {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "min-w-[28px] h-7 px-2 rounded-md text-xs font-medium transition-colors",
                      p === safePage ? "bg-gold-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-500 to-blue-500" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">รายละเอียด</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              {cfg.columns.map((c) => (
                <div key={c.key} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 mb-0.5">{c.label}</p>
                  <div className="text-sm font-medium text-slate-800">{renderCell(c, detail[c.key], cfg.badgeMap)}</div>
                </div>
              ))}
            </div>
            {wf && String(detail[wf.statusKey]) === wf.pending && (
              <div className="flex gap-2 px-6 pb-2">
                <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => applyWorkflow(detail, wf.reject, "ปฏิเสธแล้ว")}>
                  <XCircle size={14} /> ปฏิเสธ
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => applyWorkflow(detail, wf.approve, "อนุมัติแล้ว")}>
                  <CheckCircle2 size={14} /> อนุมัติ
                </Button>
              </div>
            )}
            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(detail)}>
                <Trash2 size={14} /> ลบ
              </Button>
              <Button className="flex-1" onClick={() => openEdit(detail)}>
                <Pencil size={14} /> แก้ไข
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {editId ? `แก้ไข${cfg.title}` : cfg.addLabel ?? `เพิ่ม${cfg.title}`}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 grid grid-cols-2 gap-4">
              {cfg.columns.map((c, i) => (
                <div key={c.key} className={cn("space-y-1.5", i === 0 && "col-span-2")}>
                  <Label>{c.label}{i === 0 && " *"}</Label>
                  {c.type === "badge" ? (
                    <select className={formSelectClass} value={form[c.key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}>
                      {optionsFor(c.key).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : c.type === "date" ? (
                    <Input type="date" value={form[c.key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} />
                  ) : c.type === "number" || c.type === "currency" ? (
                    <Input type="number" value={form[c.key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} placeholder={c.type === "currency" ? "฿" : ""} />
                  ) : (
                    <Input value={form[c.key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))} placeholder={c.label} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
              <Button variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={submitForm}>{editId ? "บันทึก" : "เพิ่ม"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm (single) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-500 mt-1">
              ลบ &ldquo;{String(deleteTarget[cfg.columns[0].key])}&rdquo; ออกจากรายการ? การกระทำนี้ย้อนกลับไม่ได้
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmDelete}>ลบ</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBulkDeleteOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ลบ {selected.size} รายการ</h2>
            <p className="text-sm text-slate-500 mt-1">ลบรายการที่เลือกทั้งหมด? การกระทำนี้ย้อนกลับไม่ได้</p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setBulkDeleteOpen(false)}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmBulkDelete}>ลบทั้งหมด</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
