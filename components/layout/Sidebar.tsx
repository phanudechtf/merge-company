"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CalendarX2,
  Banknote,
  Timer,
  TrendingUp,
  UserPlus,
  Search,
  UserCheck,
  ClipboardList,
  GraduationCap,
  Star,
  Target,
  FileText,
  Package,
  Receipt,
  Heart,
  Shield,
  Bell,
  BarChart3,
  UserCog,
  Settings2,
  ChevronDown,
  Network,
  DoorOpen,
  X,
  LogOut,
  UserCircle,
  Gauge,
  Shirt,
  ShoppingCart,
  Contact,
  Megaphone,
  Store,
  Warehouse,
  Map,
  Mic,
  Workflow,
  PackagePlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/layout/SidebarContext";
import { useProfile } from "@/components/layout/ProfileContext";
import { useNotifications } from "@/components/layout/NotificationContext";
import { useToast } from "@/components/ui/toast";

// จำนวนของใหม่/รอดำเนินการต่อเมนู (mock) — ดูแล้ว badge หาย
const badgeCounts: Record<string, number> = {
  "/work-orders": 3,
  "/leaves": 2,
  "/expenses": 2,
  "/applicants": 2,
  "/announcements": 1,
};

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
}

const menuGroups = [
  {
    label: "ภาพรวม",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "การ์ดงาน", href: "/work-orders", icon: <ClipboardList size={16} /> },
      { label: "ภาพรวมระบบ", href: "/overview", icon: <Workflow size={16} /> },
    ],
  },
  {
    label: "Retail & Operations",
    items: [
      { label: "Ops Dashboard", href: "/retail", icon: <Gauge size={16} /> },
      { label: "คำสั่งซื้อ", href: "/orders", icon: <ShoppingCart size={16} /> },
      { label: "สินค้า", href: "/products", icon: <Shirt size={16} /> },
      { label: "สต๊อก & คลัง", href: "/inventory", icon: <Warehouse size={16} /> },
      { label: "ลูกค้า", href: "/customers", icon: <Contact size={16} /> },
      { label: "แคมเปญ", href: "/campaigns", icon: <Megaphone size={16} /> },
      { label: "สาขาค้าปลีก", href: "/stores", icon: <Store size={16} /> },
      { label: "แผนที่สาขา 3D", href: "/branch-map", icon: <Map size={16} /> },
      { label: "โกดัง 3D", href: "/warehouse-3d", icon: <Warehouse size={16} /> },
    ],
  },
  {
    label: "บุคลากร",
    items: [
      { label: "พนักงาน", href: "/employees", icon: <Users size={16} /> },
      { label: "ผังองค์กร", href: "/org-chart", icon: <Network size={16} /> },
      { label: "แผนก", href: "/departments", icon: <Building2 size={16} /> },
      { label: "ตำแหน่งงาน", href: "/positions", icon: <Briefcase size={16} /> },
      { label: "สาขา", href: "/branches", icon: <MapPin size={16} /> },
    ],
  },
  {
    label: "เวลา & การลา",
    items: [
      { label: "ตารางงาน", href: "/schedules", icon: <Calendar size={16} /> },
      { label: "บันทึกเวลา", href: "/attendance", icon: <Clock size={16} /> },
      { label: "การลา", href: "/leaves", icon: <CalendarX2 size={16} /> },
    ],
  },
  {
    label: "สถานที่",
    items: [
      { label: "ห้องประชุม", href: "/meeting-rooms", icon: <DoorOpen size={16} /> },
      { label: "บันทึกการประชุม", href: "/meetings", icon: <Mic size={16} /> },
    ],
  },
  {
    label: "การเงิน",
    items: [
      { label: "ขอซื้อของ", href: "/purchase-requests", icon: <PackagePlus size={16} /> },
      { label: "เงินเดือน", href: "/payroll", icon: <Banknote size={16} /> },
      { label: "OT", href: "/overtime", icon: <Timer size={16} /> },
      { label: "ค่าคอมมิชชั่น", href: "/commission", icon: <TrendingUp size={16} /> },
      { label: "เบิกค่าใช้จ่าย", href: "/expenses", icon: <Receipt size={16} /> },
    ],
  },
  {
    label: "สรรหา",
    items: [
      { label: "สรรหา", href: "/recruitment", icon: <UserPlus size={16} /> },
      { label: "ผู้สมัคร", href: "/applicants", icon: <Search size={16} /> },
      { label: "Onboarding", href: "/onboarding", icon: <UserCheck size={16} /> },
    ],
  },
  {
    label: "พัฒนาบุคลากร",
    items: [
      { label: "อบรม", href: "/training", icon: <GraduationCap size={16} /> },
      { label: "ประเมินผล", href: "/evaluation", icon: <Star size={16} /> },
      { label: "OKR", href: "/okr", icon: <Target size={16} /> },
    ],
  },
  {
    label: "ทรัพยากร",
    items: [
      { label: "เอกสาร HR", href: "/documents", icon: <FileText size={16} /> },
      { label: "ทรัพย์สิน", href: "/assets", icon: <Package size={16} /> },
      { label: "สวัสดิการ", href: "/benefits", icon: <Heart size={16} /> },
      { label: "ประกันสังคม", href: "/social-security", icon: <Shield size={16} /> },
    ],
  },
  {
    label: "สื่อสาร & รายงาน",
    items: [
      { label: "ประกาศ", href: "/announcements", icon: <Bell size={16} /> },
      { label: "รายงาน", href: "/reports", icon: <BarChart3 size={16} /> },
    ],
  },
  {
    label: "ระบบ",
    items: [
      { label: "จัดการผู้ใช้", href: "/users", icon: <UserCog size={16} /> },
      { label: "ตั้งค่า", href: "/settings", icon: <Settings2 size={16} /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { name, role, initials, avatarUrl } = useProfile();
  const { unreadCount } = useNotifications();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // mark เมนูที่เข้าดูแล้ว → badge หาย
  useEffect(() => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(pathname);
      return next;
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={closeMobile} />
      )}

      <aside
        className={cn(
          "flex flex-col w-[264px] min-w-[264px] h-screen bg-[#111111] border-r border-[#1f1f1f] overflow-hidden z-50",
          "max-md:fixed max-md:top-0 max-md:left-0 max-md:transition-transform max-md:duration-300",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/merge-logo.png" alt="MERGE" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight tracking-wide">MERGE Workspace</p>
              <p className="text-slate-500 text-[10px] leading-tight mt-0.5">SENSE ASIA CORPORATION</p>
            </div>
          </div>
          <button onClick={closeMobile} className="md:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {/* Profile hero — เลื่อนไปกับเมนู */}
          <Link
            href="/profile"
            onClick={closeMobile}
            className="flex flex-col items-center px-4 py-4 mb-3 rounded-lg hover:bg-[#1f1f1f]/40 transition-colors group"
          >
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-full object-cover ring-2 ring-[#2a2a2a] group-hover:ring-gold-500 transition-all" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-white text-xl font-bold ring-2 ring-[#2a2a2a] group-hover:ring-gold-500 transition-all">
                  {initials}
                </div>
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#111111] animate-in zoom-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <p className="text-white text-sm font-semibold mt-2.5 truncate max-w-full">{name}</p>
            <p className="text-slate-500 text-[11px] truncate max-w-full">{role}</p>
          </Link>

          {menuGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2 py-1.5 mb-0.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </span>
                <ChevronDown
                  size={11}
                  className={cn(
                    "text-slate-500 transition-transform",
                    collapsed[group.label] && "-rotate-90"
                  )}
                />
              </button>
              {!collapsed[group.label] && (
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const count = badgeCounts[item.href] ?? 0;
                    const showBadge = count > 0 && !visited.has(item.href) && pathname !== item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          className={cn(
                            "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                              ? "bg-[#1f1f1f] text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-full before:bg-gold-500"
                              : "text-slate-400 hover:bg-[#1f1f1f] hover:text-slate-200"
                          )}
                        >
                          <span className={cn(isActive ? "text-gold-500" : "text-slate-500")}>
                            {item.icon}
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {showBadge && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* User footer + profile menu */}
        <div className="relative px-4 py-3 border-t border-[#1f1f1f]">
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-20">
                <Link
                  href="/profile"
                  onClick={() => { setProfileOpen(false); closeMobile(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  <UserCircle size={15} /> โปรไฟล์
                </Link>
                <Link
                  href="/settings"
                  onClick={() => { setProfileOpen(false); closeMobile(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-[#2a2a2a] transition-colors"
                >
                  <Settings2 size={15} /> ตั้งค่า
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); toast("ออกจากระบบ (mock) — Auth.js ยังไม่ต่อ", "info"); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors border-t border-[#2a2a2a]"
                >
                  <LogOut size={15} /> ออกจากระบบ
                </button>
              </div>
            </>
          )}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 w-full rounded-lg hover:bg-[#1f1f1f] p-1 -m-1 transition-colors"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gold-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-slate-200 text-xs font-medium truncate">{name}</p>
              <p className="text-slate-500 text-[10px] truncate">{role}</p>
            </div>
            <ChevronDown size={14} className={cn("text-slate-500 transition-transform", profileOpen && "rotate-180")} />
          </button>
        </div>
      </aside>
    </>
  );
}
