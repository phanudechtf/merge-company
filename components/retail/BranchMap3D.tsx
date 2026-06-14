"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin, Phone, Clock, Compass, X, Users, Ruler, CalendarDays,
  Hammer, Moon, TrendingUp, TrendingDown, UserCircle2, CalendarSearch, CheckCircle2, CircleDashed,
  ChevronLeft, Package, ClipboardPlus, Filter, Search, Layers, Wallet,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { stores, storeOps, storeTeam } from "@/lib/mock-retail";
import { getShipmentsFor, type Shipment } from "@/lib/store-shipments";
import { useToast } from "@/components/ui/toast";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const BANGKOK_CENTER: [number, number] = [100.553, 13.78];

const typeColor: Record<string, string> = {
  "STORE": "#111111",
  "Central Dept": "#c5c9cf",
  "Pop-Up": "#64748b",
};

const types = ["STORE", "Central Dept", "Pop-Up"];

const perfColor: Record<string, string> = { over: "#10b981", under: "#f59e0b" };

// pin images drawn on canvas — symbol layers are NOT depth-occluded by 3D buildings (circles are)
function makePinImage(color: string, ring: string) {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color + "2e";
  ctx.beginPath();
  ctx.arc(48, 48, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(48, 48, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = ring;
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

const branchGeojson: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: stores.map((s, i) => ({
    type: "Feature",
    id: i,
    geometry: { type: "Point", coordinates: [Number(s.lng), Number(s.lat)] },
    properties: {
      store: String(s.store),
      type: String(s.type),
      color: typeColor[String(s.type)],
      under: Number(s.sales) < Number(s.target),
    },
  })),
};

export function BranchMap3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [activeType, setActiveType] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dayViewOpen, setDayViewOpen] = useState(false);
  const [underTargetOnly, setUnderTargetOnly] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [checkedOverride, setCheckedOverride] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [colorMode, setColorMode] = useState<"type" | "perf">("type");

  const router = useRouter();
  const toast = useToast();

  const createWorkOrderFor = (title: string) => {
    toast(`เปิดหน้าการ์ดงาน — สร้างงาน “${title}” ให้ ${selected}`);
    router.push("/work-orders");
  };
  const toggleCheck = (key: string, fallback: boolean) =>
    setCheckedOverride((prev) => ({ ...prev, [key]: !(prev[key] ?? fallback) }));

  const openBranch = (storeName: string, fly: boolean) => {
    const map = mapRef.current;
    const s = stores.find((x) => x.store === storeName);
    if (!map || !s) return;
    setSelected(storeName);
    setShipments(getShipmentsFor(storeName)); // ลังที่กำลังส่งมาสาขานี้
    setDetailOpen(false); // show only the side tab — details open on demand
    if (fly) {
      map.flyTo({ center: [Number(s.lng), Number(s.lat)], zoom: 16, pitch: 58, bearing: -15, duration: 1800 });
    }
  };
  const openBranchRef = useRef(openBranch);
  openBranchRef.current = openBranch;

  const closeDetail = () => {
    setSelected(null);
    setShipments([]);
    setDetailOpen(false);
    setDayViewOpen(false);
  };

  // mock: today's shift roster derived deterministically from the team list
  const shiftFor = (i: number, role: string) => {
    if (/Manager|Lead/.test(role)) return { shift: "เช้า 10:00–19:00", in: true };
    if (i % 4 === 3) return { shift: "หยุด (OFF)", in: false };
    if (i % 2 === 1) return { shift: "บ่าย 13:00–22:00", in: i % 3 !== 0 };
    return { shift: "เช้า 10:00–19:00", in: true };
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: BANGKOK_CENTER,
      zoom: 10.3,
      pitch: 50,
      bearing: -12,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      // 3D building extrusion from the basemap's vector source (OpenMapTiles schema)
      try {
        const sources = map.getStyle().sources;
        const vectorSrc = Object.keys(sources).find((k) => sources[k].type === "vector");
        if (vectorSrc && !map.getLayer("merge-3d-buildings")) {
          map.addLayer({
            id: "merge-3d-buildings",
            type: "fill-extrusion",
            source: vectorSrc,
            "source-layer": "building",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": "#ddd5c8",
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 10],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              "fill-extrusion-opacity": 0.8,
            },
          });
        }
      } catch {
        // basemap without building layer — skip 3D extrusion, pins still work
      }

      map.addSource("branches", { type: "geojson", data: branchGeojson });

      for (const t of types) {
        map.addImage(`pin-${t}`, makePinImage(typeColor[t], "#ffffff"), { pixelRatio: 4 });
        map.addImage(`pin-selected-${t}`, makePinImage(typeColor[t], "#d7d7d7"), { pixelRatio: 4 });
      }
      // หมุดสีตามผลงาน — เกินเป้า (เขียว) / ต่ำกว่าเป้า (ส้ม)
      for (const [k, col] of Object.entries(perfColor)) {
        map.addImage(`pin-${k}`, makePinImage(col, "#ffffff"), { pixelRatio: 4 });
        map.addImage(`pin-selected-${k}`, makePinImage(col, "#d7d7d7"), { pixelRatio: 4 });
      }

      map.addLayer({
        id: "branch-pin",
        type: "symbol",
        source: "branches",
        layout: {
          "icon-image": ["concat", "pin-", ["get", "type"]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.9, 16, 1.4],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      map.addLayer({
        id: "branch-pin-selected",
        type: "symbol",
        source: "branches",
        filter: ["==", ["get", "store"], "__none__"],
        layout: {
          "icon-image": ["concat", "pin-selected-", ["get", "type"]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 1.2, 16, 1.8],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      map.addLayer({
        id: "branch-label",
        type: "symbol",
        source: "branches",
        minzoom: 11,
        layout: {
          "text-field": ["get", "store"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#111111",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      map.on("mouseenter", "branch-pin", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "branch-pin", () => { map.getCanvas().style.cursor = ""; });
      map.on("click", "branch-pin", (e) => {
        const name = e.features?.[0]?.properties?.store as string | undefined;
        if (name) openBranchRef.current(name, false);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filter pins by type + highlight selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (!map.getLayer("branch-pin")) return;
      const parts: unknown[] = [];
      if (activeType !== "all") parts.push(["==", ["get", "type"], activeType]);
      if (underTargetOnly) parts.push(["==", ["get", "under"], true]);
      const baseFilter = (parts.length === 0 ? null : parts.length === 1 ? parts[0] : ["all", ...parts]) as maplibregl.FilterSpecification | null;
      map.setFilter("branch-pin", baseFilter);
      map.setFilter("branch-label", baseFilter);
      const selFilter = ["==", ["get", "store"], selected ?? "__none__"] as maplibregl.FilterSpecification;
      map.setFilter("branch-pin-selected", baseFilter ? (["all", selFilter, baseFilter] as maplibregl.FilterSpecification) : selFilter);
    };
    if (map.getLayer("branch-pin")) apply();
    else map.once("idle", apply);
  }, [activeType, selected, underTargetOnly]);

  // สลับสีหมุด: ตามประเภท ↔ ตามผลงาน (เกิน/ต่ำเป้า)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (!map.getLayer("branch-pin")) return;
      const pinExpr: unknown = colorMode === "type"
        ? ["concat", "pin-", ["get", "type"]]
        : ["case", ["get", "under"], "pin-under", "pin-over"];
      const selExpr: unknown = colorMode === "type"
        ? ["concat", "pin-selected-", ["get", "type"]]
        : ["case", ["get", "under"], "pin-selected-under", "pin-selected-over"];
      map.setLayoutProperty("branch-pin", "icon-image", pinExpr as never);
      map.setLayoutProperty("branch-pin-selected", "icon-image", selExpr as never);
    };
    if (map.getLayer("branch-pin")) apply();
    else map.once("idle", apply);
  }, [colorMode]);

  const resetView = () => {
    closeDetail();
    mapRef.current?.flyTo({ center: BANGKOK_CENTER, zoom: 10.3, pitch: 50, bearing: -12, duration: 1500 });
  };

  const q = query.trim().toLowerCase();
  const filtered = stores
    .filter((s) => activeType === "all" || s.type === activeType)
    .filter((s) => !underTargetOnly || Number(s.sales) < Number(s.target))
    .filter((s) => !q || String(s.store).toLowerCase().includes(q) || String(s.location).toLowerCase().includes(q));
  const underCount = stores.filter((s) => Number(s.sales) < Number(s.target)).length;
  const overCount = stores.length - underCount;
  const renoCount = Object.values(storeOps).filter((o) => o.condition === "ปรับปรุงบางส่วน").length;
  const totalSales = stores.reduce((s, x) => s + Number(x.sales), 0);

  const sel = selected ? stores.find((x) => x.store === selected) : null;
  const ops = selected ? storeOps[selected] : null;
  const team = selected ? storeTeam[selected] ?? [] : [];
  const selPct = sel ? Math.round((Number(sel.sales) / Number(sel.target)) * 100) : 0;

  return (
    // explicit viewport height (not h-full) — keeps the whole page to one screen in every browser
    <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] overflow-hidden">
      {/* Branch list panel */}
      <div className="w-full md:w-[300px] md:min-w-[300px] border-b md:border-b-0 md:border-r border-line bg-white flex flex-col h-[38vh] md:h-auto">
        <div className="p-4 border-b border-line">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-ink">{stores.length} สาขาทั่วประเทศ</p>
            <button onClick={resetView} className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
              <Compass size={12} /> มุมเริ่มต้น
            </button>
          </div>

          {/* KPI สรุป */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "เกินเป้า", value: overCount, icon: <TrendingUp size={12} />, color: "text-emerald-600" },
              { label: "ต่ำกว่าเป้า", value: underCount, icon: <TrendingDown size={12} />, color: "text-amber-600" },
              { label: "กำลังปรับปรุง", value: renoCount, icon: <Hammer size={12} />, color: "text-orange-500" },
              { label: "ยอดรวม/เดือน", value: `฿${(totalSales / 1e6).toFixed(1)}M`, icon: <Wallet size={12} />, color: "text-gold-600" },
            ].map((k) => (
              <div key={k.label} className="bg-ivory rounded-xl p-2.5">
                <span className={k.color}>{k.icon}</span>
                <p className="text-sm font-bold text-ink tabular-nums mt-1">{k.value}</p>
                <p className="text-[10px] text-slate-400">{k.label}</p>
              </div>
            ))}
          </div>

          {/* ค้นหาสาขา */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาสาขา / ทำเล..."
              className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-line bg-ivory/60 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["all", ...types].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  activeType === t
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-slate-500 border-line hover:border-slate-300"
                )}
              >
                {t === "all" ? `ทั้งหมด (${stores.length})` : `${t} (${stores.filter((s) => s.type === t).length})`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={() => setUnderTargetOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                underTargetOnly
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-amber-600 border-amber-200 hover:border-amber-300"
              )}
            >
              <Filter size={11} /> เฉพาะต่ำกว่าเป้า ({underCount})
            </button>
            <button
              onClick={() => setColorMode((m) => (m === "type" ? "perf" : "type"))}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                colorMode === "perf"
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-slate-500 border-line hover:border-slate-300"
              )}
            >
              <Layers size={11} /> สี: {colorMode === "type" ? "ตามประเภท" : "ตามผลงาน"}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {filtered.map((s) => {
            const o = storeOps[String(s.store)];
            return (
              <button
                key={String(s.store)}
                onClick={() => openBranch(String(s.store), true)}
                className={cn(
                  "flex items-start gap-2.5 w-full p-2.5 rounded-xl text-left transition-colors",
                  selected === s.store ? "bg-gold-50 ring-1 ring-gold-200" : "hover:bg-ivory"
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: typeColor[String(s.type)] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="block text-sm font-medium text-slate-800 truncate">{s.store}</span>
                    {o?.condition === "ปรับปรุงบางส่วน" && (
                      <Hammer size={11} className="text-amber-500 shrink-0" />
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                    <MapPin size={10} className="shrink-0" /> {s.location}
                  </span>
                  <span className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Clock size={10} /> {s.hours}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {o?.staff ?? "—"} คน</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-line shadow-sm px-3.5 py-2.5 space-y-1.5">
          {colorMode === "type"
            ? types.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColor[t] }} />
                  <span className="text-[11px] text-slate-600">{t}</span>
                  <span className="text-[11px] text-slate-400 ml-auto pl-3 tabular-nums">{stores.filter((s) => s.type === t).length}</span>
                </div>
              ))
            : [
                { label: "เกินเป้า", color: perfColor.over, count: overCount },
                { label: "ต่ำกว่าเป้า", color: perfColor.under, count: underCount },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-[11px] text-slate-600">{r.label}</span>
                  <span className="text-[11px] text-slate-400 ml-auto pl-3 tabular-nums">{r.count}</span>
                </div>
              ))}
        </div>

        {/* Collapsed side tab — click to slide the detail panel in */}
        {sel && !detailOpen && (
          <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10 flex flex-col items-center bg-ink text-white rounded-l-2xl shadow-xl overflow-hidden">
            <button
              onClick={() => setDetailOpen(true)}
              className="flex flex-col items-center gap-2 px-2.5 pt-4 pb-3 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={15} className="text-gold-500" />
              <span className="[writing-mode:vertical-rl] text-xs font-semibold tracking-wide max-h-44 truncate">
                MERGE {sel.store}
              </span>
              <span className="[writing-mode:vertical-rl] text-[10px] text-slate-400">ดูข้อมูลสาขา</span>
            </button>
            <button
              onClick={closeDetail}
              className="w-full flex justify-center py-2 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="ปิด"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Branch detail card — slides in from the right */}
        {sel && (
          <div className={cn(
            "absolute top-3 right-3 bottom-3 w-[330px] max-w-[calc(100%-1.5rem)] bg-white/[0.98] backdrop-blur rounded-2xl border border-line shadow-xl flex flex-col overflow-hidden transition-transform duration-300",
            detailOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"
          )}>
            {/* Card header */}
            <div className="p-4 border-b border-line shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeColor[String(sel.type)] }} />
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">{sel.type}</span>
                  </div>
                  <h2 className="text-base font-bold text-ink truncate">MERGE {sel.store}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{sel.location}</p>
                </div>
                <button onClick={() => setDetailOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0" title="หุบเป็นแท็บ">
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  ops?.condition === "ปรับปรุงบางส่วน" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {ops?.condition ?? "เปิดบริการปกติ"}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock size={10} /> {sel.hours}
                </span>
                {sel.tel !== "—" && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Phone size={10} /> {sel.tel}
                  </span>
                )}
              </div>
            </div>

            {/* Card body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {/* Quick facts */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-ivory rounded-xl p-2.5">
                  <Users size={13} className="text-gold-600 mb-1" />
                  <p className="text-sm font-bold text-ink tabular-nums">{ops?.staff ?? "—"}</p>
                  <p className="text-[10px] text-slate-400">พนักงาน</p>
                </div>
                <div className="bg-ivory rounded-xl p-2.5">
                  <Ruler size={13} className="text-gold-600 mb-1" />
                  <p className="text-sm font-bold text-ink tabular-nums">{ops?.areaSqm ?? "—"}</p>
                  <p className="text-[10px] text-slate-400">ตร.ม.</p>
                </div>
                <div className="bg-ivory rounded-xl p-2.5">
                  <CalendarDays size={13} className="text-gold-600 mb-1" />
                  <p className="text-sm font-bold text-ink tabular-nums">{ops?.opened ?? "—"}</p>
                  <p className="text-[10px] text-slate-400">เปิดปี</p>
                </div>
              </div>

              {/* Sales vs target */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <TrendingUp size={12} className="text-gold-600" /> ยอดขายเดือนนี้
                  </p>
                  <p className="text-xs tabular-nums">
                    <span className="font-bold text-ink">฿{formatCurrency(Number(sel.sales))}</span>
                    <span className={selPct >= 100 ? "text-emerald-600" : "text-amber-600"}> · {selPct}%</span>
                  </p>
                </div>
                <div className="h-2 bg-ivory rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", selPct >= 100 ? "bg-emerald-500" : "bg-amber-400")}
                    style={{ width: `${Math.min(selPct, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">เป้า ฿{formatCurrency(Number(sel.target))} · Conversion {sel.conversion}</p>
              </div>

              {/* ลังกำลังส่งมา (จากใบจัดของโกดัง) */}
              {shipments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                    <Package size={12} className="text-gold-600" /> ลังกำลังส่งมา ({shipments.length})
                  </p>
                  <div className="space-y-1.5">
                    {shipments.map((sh) => (
                      <div key={sh.code} className="bg-gold-50/60 border border-gold-100 rounded-xl p-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gold-700">{sh.code}</p>
                          <span className="text-[10px] text-slate-400">{sh.items.length} รายการ · {sh.total} ชิ้น</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{sh.items.map((i) => i.name).join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renovation notice */}
              {ops?.renovation && (
                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <Hammer size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700">งานปรับปรุง</p>
                      <p className="text-xs text-slate-600 mt-0.5">{ops.renovation}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => createWorkOrderFor(`ปรับปรุงสาขา: ${ops.renovation}`)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 h-7 rounded-lg bg-white border border-amber-200 text-amber-700 text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <ClipboardPlus size={12} /> แจ้งเป็นการ์ดงาน
                  </button>
                </div>
              )}

              {/* Team roster */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                  <UserCircle2 size={12} className="text-gold-600" /> ทีมประจำสาขา
                </p>
                <div className="space-y-1">
                  {team.map((m) => (
                    <div key={m.name} className="flex items-center gap-2.5 py-1">
                      <span className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {m.name.slice(0, 1)}
                      </span>
                      <span className="text-xs text-slate-700 flex-1 truncate">{m.name}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                        /Manager|Lead/.test(m.role) ? "bg-ink text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                  {ops && team.length < ops.staff && (
                    <p className="text-[10px] text-slate-400 pl-9">+ พนักงานอีก {ops.staff - team.length} คน</p>
                  )}
                </div>
              </div>

              {/* Activities timeline */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">กิจกรรม & งานที่กำลังจะถึง</p>
                <div className="space-y-2.5">
                  {(ops?.activities ?? []).map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        a.night ? "bg-indigo-50 text-indigo-500" : "bg-ivory text-gold-600"
                      )}>
                        {a.night ? <Moon size={12} /> : <Clock size={12} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400">
                          {a.time} · <span className="font-medium text-slate-500">ทีม {a.team}</span>
                        </p>
                        <p className="text-xs text-slate-700 mt-0.5">{a.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-3 border-t border-line shrink-0 flex gap-2">
              <button
                onClick={() => createWorkOrderFor(`งานที่ ${sel.store}`)}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-line text-slate-600 text-xs font-semibold hover:bg-ivory transition-colors shrink-0"
                title="สร้างการ์ดงานให้สาขานี้"
              >
                <ClipboardPlus size={14} /> การ์ดงาน
              </button>
              <button
                onClick={() => setDayViewOpen(true)}
                className="flex items-center justify-center gap-2 flex-1 h-9 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-black/85 transition-colors"
              >
                <CalendarSearch size={13} /> ดูรายละเอียดวันนี้
              </button>
            </div>
          </div>
        )}

        {/* Day-view deep-dive modal */}
        {dayViewOpen && sel && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDayViewOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-full flex flex-col overflow-hidden">
              <div className="flex items-start justify-between px-5 py-4 border-b border-line shrink-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">วันนี้ที่สาขา · พฤ. 11 มิ.ย. 2569</p>
                  <h2 className="text-base font-bold text-ink mt-0.5">MERGE {sel.store}</h2>
                </div>
                <button onClick={() => setDayViewOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <X size={17} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
                {/* Today KPIs */}
                <div className="grid grid-cols-3 gap-2.5">
                  {(() => {
                    const roster = team.map((m, i) => {
                      const sft = shiftFor(i, m.role);
                      const key = `${sel.store}|${m.name}`;
                      return { ...m, ...sft, isIn: checkedOverride[key] ?? sft.in };
                    });
                    const working = roster.filter((r) => !r.shift.includes("OFF"));
                    const checkedIn = working.filter((r) => r.isIn);
                    const todayActs = (ops?.activities ?? []).filter((a) => /วันนี้|คืนนี้/.test(a.time));
                    return [
                      { label: "เข้ากะวันนี้", value: `${working.length} คน` },
                      { label: "เช็กอินแล้ว", value: `${checkedIn.length} คน` },
                      { label: "งาน/อีเวนต์วันนี้", value: `${todayActs.length} รายการ` },
                    ].map((k) => (
                      <div key={k.label} className="bg-ivory rounded-xl p-3">
                        <p className="text-lg font-bold text-ink tabular-nums">{k.value}</p>
                        <p className="text-[10px] text-slate-400">{k.label}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Shift roster */}
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">กะพนักงานวันนี้</p>
                  <div className="rounded-xl border border-line overflow-hidden">
                    {team.map((m, i) => {
                      const sft = shiftFor(i, m.role);
                      const key = `${sel.store}|${m.name}`;
                      const isIn = checkedOverride[key] ?? sft.in;
                      const off = sft.shift.includes("OFF");
                      return (
                        <div key={m.name} className="flex items-center gap-2.5 px-3 py-2 border-b border-line/60 last:border-0 bg-white">
                          <span className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {m.name.slice(0, 1)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-slate-800 truncate">{m.name}</span>
                            <span className="block text-[10px] text-slate-400">{m.role}</span>
                          </span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                            off ? "bg-slate-100 text-slate-400" : sft.shift.includes("เช้า") ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {sft.shift}
                          </span>
                          {off ? (
                            <span className="w-4 shrink-0" />
                          ) : (
                            <button
                              onClick={() => toggleCheck(key, sft.in)}
                              title={isIn ? "เช็กเอาท์" : "เช็กอิน"}
                              className="shrink-0 transition-colors"
                            >
                              {isIn ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                              ) : (
                                <CircleDashed size={16} className="text-slate-300 hover:text-emerald-400" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-3">
                    <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-500" /> เช็กอินแล้ว</span>
                    <span className="flex items-center gap-1"><CircleDashed size={11} className="text-slate-300" /> ยังไม่เข้ากะ</span>
                  </p>
                </div>

                {/* Today's schedule */}
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">ตารางงาน & อีเวนต์</p>
                  <div className="space-y-2.5">
                    {(ops?.activities ?? []).map((a, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-2.5 rounded-xl p-3",
                        /วันนี้|คืนนี้/.test(a.time) ? "bg-gold-50/60 border border-gold-100" : "bg-ivory"
                      )}>
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          a.night ? "bg-indigo-100 text-indigo-500" : "bg-white text-gold-600"
                        )}>
                          {a.night ? <Moon size={13} /> : <Clock size={13} />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-slate-500">{a.time} · ทีม {a.team}</p>
                          <p className="text-xs text-slate-800 mt-0.5">{a.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Renovation */}
                {ops?.renovation && (
                  <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-100 rounded-xl p-3">
                    <Hammer size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700">งานปรับปรุงที่กำลังดำเนินการ</p>
                      <p className="text-xs text-slate-600 mt-0.5">{ops.renovation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
