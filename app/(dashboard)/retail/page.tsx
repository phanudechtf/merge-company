import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingCart, Receipt, Users, ArrowUpRight,
  Store, Shirt, Warehouse, Megaphone, AlertTriangle, Crown,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { cn, formatCurrency } from "@/lib/utils";
import {
  products, orders, customers, campaigns, stores, inventory,
  salesTrend, channelSplit,
} from "@/lib/mock-retail";

const channelTone: Record<string, string> = {
  "หน้าร้าน": "bg-ink",
  "ออนไลน์": "bg-gold-500",
  "Marketplace": "bg-amber-400",
  "Wholesale": "bg-slate-300",
};

const orderStatusTone: Record<string, string> = {
  "รอชำระ": "bg-amber-100 text-amber-700",
  "ชำระแล้ว": "bg-blue-100 text-blue-700",
  "รอแพ็ก": "bg-slate-100 text-slate-600",
  "กำลังจัดส่ง": "bg-amber-100 text-amber-700",
  "ส่งสำเร็จ": "bg-emerald-100 text-emerald-700",
  "ยกเลิก": "bg-red-100 text-red-600",
};

const tierTone: Record<string, string> = {
  VIP: "bg-emerald-500",
  Gold: "bg-gold-500",
  Silver: "bg-slate-400",
  New: "bg-blue-400",
};

export default function RetailDashboardPage() {
  const weekSales = salesTrend.reduce((s, d) => s + d.sales, 0);
  const weekOrders = salesTrend.reduce((s, d) => s + d.orders, 0);
  const aov = Math.round(weekSales / weekOrders);
  const maxTrend = Math.max(...salesTrend.map((d) => d.sales));
  const today = salesTrend[salesTrend.length - 1];
  const yesterday = salesTrend[salesTrend.length - 2];
  const todayDelta = Math.round(((today.sales - yesterday.sales) / yesterday.sales) * 100);

  const topStores = [...stores].sort((a, b) => Number(b.sales) - Number(a.sales)).slice(0, 8);
  const topProducts = [...products].sort((a, b) => Number(b.sold) - Number(a.sold)).slice(0, 5);
  const maxSold = Math.max(...topProducts.map((p) => Number(p.sold)));
  const lowStock = inventory.filter((i) => ["ต้องสั่งเพิ่ม", "หมดสต๊อก"].includes(String(i.status)));
  const recentOrders = orders.slice(0, 6);
  const activeCampaigns = campaigns.filter((c) => c.status === "กำลังทำงาน");
  const vipCount = customers.filter((c) => c.tier === "VIP").length;

  const tierCounts = ["VIP", "Gold", "Silver", "New"].map((t) => ({
    tier: t,
    count: customers.filter((c) => c.tier === t).length,
  }));
  const totalCustomers = customers.length;

  const kpis = [
    {
      label: "ยอดขายสัปดาห์นี้", value: `฿${formatCurrency(weekSales)}`,
      icon: <TrendingUp size={18} />, delta: todayDelta, sub: `วันนี้ ฿${formatCurrency(today.sales)}`,
      href: "/orders",
    },
    {
      label: "ออเดอร์", value: formatCurrency(weekOrders),
      icon: <ShoppingCart size={18} />, delta: 8, sub: "7 วันล่าสุด", href: "/orders",
    },
    {
      label: "ยอดเฉลี่ย/ออเดอร์", value: `฿${formatCurrency(aov)}`,
      icon: <Receipt size={18} />, delta: 4, sub: "Average order value", href: "/orders",
    },
    {
      label: "ลูกค้า VIP", value: `${vipCount}`,
      icon: <Crown size={18} />, delta: 12, sub: `จาก ${totalCustomers} ลูกค้า`, href: "/customers",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Operations Dashboard" breadcrumbs={["Retail", "Ops Dashboard"]} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Editorial hero with subtle monogram */}
        <div className="relative overflow-hidden rounded-2xl bg-ink text-white px-7 py-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/merge-logo.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-8 -bottom-10 w-52 h-52 object-contain opacity-[0.06] invert"
          />
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400 font-medium">MERGE Fashion · Retail Operations</p>
          <h1 className="text-2xl font-bold mt-2 tracking-tight">ภาพรวมการดำเนินงาน</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
            สรุปยอดขาย สต๊อก สาขา และแคมเปญแบบเรียลไทม์ — อัปเดต 10 มิ.ย. 2026
          </p>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="bg-white rounded-2xl border border-line p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center text-ink">
                  {k.icon}
                </div>
                <span className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  k.delta >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  {k.delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {Math.abs(k.delta)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-ink mt-4 tabular-nums">{k.value}</p>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{k.label}</p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </Link>
          ))}
        </div>

        {/* Sales Overview + Channel split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Sales Overview — 7-day trend */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-ink">ยอดขายรายวัน</h2>
                <p className="text-xs text-slate-400 mt-0.5">7 วันล่าสุด · รวม ฿{formatCurrency(weekSales)}</p>
              </div>
              <Link href="/orders" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ดูออเดอร์ <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="flex items-end justify-between gap-3 h-48">
              {salesTrend.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    ฿{Math.round(d.sales / 1000)}k
                  </span>
                  <div
                    className={cn(
                      "w-full max-w-[40px] rounded-t-lg transition-all",
                      d === today ? "bg-gold-500" : "bg-ink/85 group-hover:bg-ink"
                    )}
                    style={{ height: `${(d.sales / maxTrend) * 100}%` }}
                  />
                  <span className="text-[11px] text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel split */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <h2 className="text-base font-bold text-ink mb-1">ช่องทางการขาย</h2>
            <p className="text-xs text-slate-400 mb-5">สัดส่วนยอดขายตามช่องทาง</p>
            {/* stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-5">
              {channelSplit.map((c) => (
                <div key={c.channel} className={cn("h-full", channelTone[c.channel])} style={{ width: `${c.value}%` }} />
              ))}
            </div>
            <div className="space-y-3">
              {channelSplit.map((c) => (
                <div key={c.channel} className="flex items-center gap-3">
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", channelTone[c.channel])} />
                  <span className="text-sm text-slate-700 flex-1">{c.channel}</span>
                  <span className="text-sm font-semibold text-ink tabular-nums">{c.value}%</span>
                  <span className="text-xs text-slate-400 w-20 text-right tabular-nums">฿{formatCurrency(c.sales)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store Performance + Product Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Performance */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Store size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">ผลงานสาขา · Top 8</h2>
              </div>
              <Link href="/stores" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ดูครบ {stores.length} สาขา <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {topStores.map((s) => {
                const pct = Math.round((Number(s.sales) / Number(s.target)) * 100);
                const over = pct >= 100;
                return (
                  <div key={String(s.store)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{s.store}</span>
                      <span className="text-xs text-slate-400 tabular-nums">
                        ฿{formatCurrency(Number(s.sales))} <span className={over ? "text-emerald-600" : "text-amber-600"}>· {pct}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-ivory rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", over ? "bg-emerald-500" : "bg-amber-400")}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shirt size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">สินค้าขายดี</h2>
              </div>
              <Link href="/products" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ทั้งหมด <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-3.5">
              {topProducts.map((p, i) => (
                <div key={String(p.sku)} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-slate-300 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">{p.name}</span>
                      <span className="text-xs text-slate-400 tabular-nums shrink-0">{p.sold} ชิ้น</span>
                    </div>
                    <div className="h-1.5 bg-ivory rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${(Number(p.sold) / maxSold) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Tracking + Inventory Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Tracking */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">ออเดอร์ล่าสุด</h2>
              </div>
              <Link href="/orders" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ทั้งหมด <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {recentOrders.map((o) => (
                <Link
                  key={String(o.orderNo)}
                  href="/orders"
                  className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-ivory transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{o.customer}</p>
                    <p className="text-[11px] text-slate-400 tabular-nums">{o.orderNo} · {o.items} ชิ้น</p>
                  </div>
                  <span className="text-sm font-semibold text-ink tabular-nums shrink-0">฿{formatCurrency(Number(o.total))}</span>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 w-20 text-center", orderStatusTone[String(o.status)])}>
                    {o.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Inventory Status / Warehouse Monitoring */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Warehouse size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">แจ้งเตือนสต๊อก</h2>
              </div>
              <Link href="/inventory" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                คลังสินค้า <ArrowUpRight size={12} />
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">สต๊อกทุกรายการอยู่ในระดับปกติ</p>
            ) : (
              <div className="space-y-2.5">
                {lowStock.map((i) => {
                  const out = i.status === "หมดสต๊อก";
                  return (
                    <div
                      key={String(i.sku)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border",
                        out ? "bg-red-50/60 border-red-100" : "bg-amber-50/50 border-amber-100"
                      )}
                    >
                      <AlertTriangle size={16} className={out ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{i.name}</p>
                        <p className="text-[11px] text-slate-400 tabular-nums">{i.sku} · {i.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-sm font-bold tabular-nums", out ? "text-red-600" : "text-amber-600")}>{i.onHand}</p>
                        <p className="text-[10px] text-slate-400">จุดสั่ง {i.reorder}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Campaign Performance + Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          {/* Campaign Performance */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Megaphone size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">แคมเปญที่กำลังทำงาน</h2>
              </div>
              <Link href="/campaigns" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ทั้งหมด <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {activeCampaigns.map((c) => (
                <div key={String(c.name)} className="flex items-center gap-3 p-3 rounded-xl bg-ivory">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.channel} · ใช้ ฿{formatCurrency(Number(c.spent))}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600 tabular-nums">{c.roas}</p>
                    <p className="text-[10px] text-slate-400">ROAS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gold-600" />
                <h2 className="text-base font-bold text-ink">กลุ่มลูกค้า</h2>
              </div>
              <Link href="/customers" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
                ทั้งหมด <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {tierCounts.map((t) => (
                <div key={t.tier}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{t.tier}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{t.count} คน</span>
                  </div>
                  <div className="h-2 bg-ivory rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", tierTone[t.tier])} style={{ width: `${(t.count / totalCustomers) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
