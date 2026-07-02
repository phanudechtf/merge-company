"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, Download, ChevronRight, Menu, Search, Bell,
  ClipboardList, CalendarX2, Receipt, FileText, PackageX, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/SidebarContext";
import { moduleConfigs } from "@/lib/module-configs";
import { mockEmployees } from "@/lib/mock-employees";
import { products, orders, customers, inventory } from "@/lib/mock-retail";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  breadcrumbs?: string[];
  onRefresh?: () => void;
  onExport?: () => void;
}

const customPages = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "การ์ดงาน", href: "/work-orders" },
  { label: "Flow บริษัท", href: "/company-flow" },
  { label: "พนักงาน", href: "/employees" },
  { label: "ผังองค์กร", href: "/org-chart" },
  { label: "ตำแหน่งงาน", href: "/positions" },
  { label: "ห้องประชุม", href: "/meeting-rooms" },
  { label: "Ops Dashboard", href: "/retail" },
  { label: "แผนที่สาขา 3D", href: "/branch-map" },
  { label: "โกดัง 3D", href: "/warehouse-3d" },
];

const navItems = [
  ...customPages,
  ...Object.entries(moduleConfigs).map(([key, cfg]) => ({ label: cfg.title, href: `/${key}` })),
];

interface Noti {
  id: string;
  icon: React.ReactNode;
  title: string;
  time: string;
  href: string;
}

// derived from real mock data so counts stay in sync with the modules
const lowStockCount = inventory.filter((i) => ["ต้องสั่งเพิ่ม", "หมดสต๊อก"].includes(String(i.status))).length;
const awaitingPackCount = orders.filter((o) => ["รอแพ็ก", "รอชำระ"].includes(String(o.status))).length;

const seedNotis: Noti[] = [
  ...(lowStockCount > 0
    ? [{ id: "r1", icon: <PackageX size={15} />, title: `สต๊อกต่ำ/หมด ${lowStockCount} รายการ ต้องสั่งเพิ่ม`, time: "เรียลไทม์", href: "/inventory" }]
    : []),
  ...(awaitingPackCount > 0
    ? [{ id: "r2", icon: <ShoppingCart size={15} />, title: `ออเดอร์รอแพ็ก/รอชำระ ${awaitingPackCount} รายการ`, time: "เรียลไทม์", href: "/orders" }]
    : []),
  { id: "n1", icon: <ClipboardList size={15} />, title: "มีงานรออนุมัติ 3 รายการ", time: "5 นาทีที่แล้ว", href: "/work-orders/all" },
  { id: "n2", icon: <CalendarX2 size={15} />, title: "คำขอลาใหม่จาก ณัฐพล มีสุข", time: "1 ชม. ที่แล้ว", href: "/leaves" },
  { id: "n3", icon: <Receipt size={15} />, title: "เบิกค่าใช้จ่าย 2 รายการรออนุมัติ", time: "3 ชม. ที่แล้ว", href: "/expenses" },
  { id: "n4", icon: <FileText size={15} />, title: "อัปเดตระเบียบพนักงาน 2026", time: "เมื่อวาน", href: "/documents" },
];

export function Header({ title, breadcrumbs = [], onRefresh, onExport }: HeaderProps) {
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const [dateTime, setDateTime] = useState("");

  const [query, setQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => {
      setDateTime(
        new Intl.DateTimeFormat("th-TH", {
          weekday: "short", year: "numeric", month: "short",
          day: "numeric", hour: "2-digit", minute: "2-digit",
        }).format(new Date())
      );
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { pages: [], employees: [], retail: [] as { label: string; sub: string; href: string; kind: string }[] };
    const retail: { label: string; sub: string; href: string; kind: string }[] = [
      ...products
        .filter((p) => String(p.name).toLowerCase().includes(q) || String(p.sku).toLowerCase().includes(q))
        .slice(0, 3)
        .map((p) => ({ label: String(p.name), sub: `${p.sku} · สินค้า`, href: "/products", kind: "สินค้า" })),
      ...orders
        .filter((o) => String(o.orderNo).toLowerCase().includes(q) || String(o.customer).toLowerCase().includes(q))
        .slice(0, 3)
        .map((o) => ({ label: String(o.orderNo), sub: `${o.customer} · ออเดอร์`, href: "/orders", kind: "ออเดอร์" })),
      ...customers
        .filter((c) => String(c.name).toLowerCase().includes(q))
        .slice(0, 3)
        .map((c) => ({ label: String(c.name), sub: `${c.tier} · ลูกค้า`, href: "/customers", kind: "ลูกค้า" })),
    ].slice(0, 6);
    return {
      pages: navItems.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 5),
      employees: mockEmployees
        .filter((e) => e.fullName.toLowerCase().includes(q) || e.positionName.toLowerCase().includes(q))
        .slice(0, 4),
      retail,
    };
  }, [query]);

  const hasResults = results.pages.length > 0 || results.employees.length > 0 || results.retail.length > 0;
  const unreadCount = seedNotis.filter((n) => !readIds.has(n.id)).length;

  const goto = (href: string) => {
    setQuery(""); setSearchFocus(false);
    router.push(href);
  };

  const openNoti = (n: Noti) => {
    setReadIds((prev) => new Set(prev).add(n.id));
    setNotiOpen(false);
    router.push(n.href);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-slate-200 shadow-sm gap-3">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700 shrink-0">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 mb-0.5">
            <span>MERGE Workspace</span>
            {breadcrumbs.map((crumb) => (
              <span key={crumb} className="flex items-center gap-1">
                <ChevronRight size={11} />
                <span>{crumb}</span>
              </span>
            ))}
          </div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 truncate">{title}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Global search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            placeholder="ค้นหา..."
            className="w-32 sm:w-48 md:w-64 h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition-all"
          />
          {searchFocus && query.trim() && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSearchFocus(false)} />
              <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-40 overflow-hidden max-h-[70vh] overflow-y-auto">
                {!hasResults ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">ไม่พบผลลัพธ์</p>
                ) : (
                  <>
                    {results.pages.length > 0 && (
                      <div className="py-1.5">
                        <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">หน้า / เมนู</p>
                        {results.pages.map((p) => (
                          <button key={p.href} onClick={() => goto(p.href)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-gold-50 transition-colors">
                            <Search size={13} className="text-slate-400" /> {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {results.retail.length > 0 && (
                      <div className="py-1.5 border-t border-slate-100">
                        <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">สินค้า · ออเดอร์ · ลูกค้า</p>
                        {results.retail.map((r) => (
                          <button key={r.kind + r.label} onClick={() => goto(r.href)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-gold-50 transition-colors">
                            <span className="w-7 h-7 rounded-lg bg-ink/5 text-ink text-[9px] font-bold flex items-center justify-center shrink-0">
                              {r.kind.slice(0, 3)}
                            </span>
                            <span className="min-w-0 text-left">
                              <span className="block text-slate-700 truncate">{r.label}</span>
                              <span className="block text-[11px] text-slate-400 truncate">{r.sub}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results.employees.length > 0 && (
                      <div className="py-1.5 border-t border-slate-100">
                        <p className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">พนักงาน</p>
                        {results.employees.map((e) => (
                          <button key={e.id} onClick={() => goto("/employees")} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-gold-50 transition-colors">
                            <span className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {e.avatarInitials}
                            </span>
                            <span className="min-w-0 text-left">
                              <span className="block text-slate-700 truncate">{e.fullName}</span>
                              <span className="block text-[11px] text-slate-400 truncate">{e.positionName}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotiOpen((v) => !v)} className="relative p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {notiOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotiOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">การแจ้งเตือน</p>
                  {unreadCount > 0 && (
                    <button onClick={() => setReadIds(new Set(seedNotis.map((n) => n.id)))} className="text-xs text-gold-600 hover:text-gold-800">
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {seedNotis.map((n) => {
                    const unread = !readIds.has(n.id);
                    return (
                      <button key={n.id} onClick={() => openNoti(n)} className={cn("flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0", unread && "bg-gold-50/40")}>
                        <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", unread ? "bg-gold-100 text-gold-600" : "bg-slate-100 text-slate-400")}>
                          {n.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-sm truncate", unread ? "font-medium text-slate-800" : "text-slate-500")}>{n.title}</span>
                          <span className="block text-[11px] text-slate-400">{n.time}</span>
                        </span>
                        {unread && <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0 mt-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <span className="text-xs text-slate-400 hidden lg:block">{dateTime}</span>

        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh" className="hidden md:flex">
            <RefreshCw size={15} />
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="hidden md:flex">
            <Download size={14} />
            Export
          </Button>
        )}
      </div>
    </header>
  );
}
