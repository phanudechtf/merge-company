import { departments, branches } from "@/lib/mock-db";
import { mockEmployees } from "@/lib/mock-employees";
import {
  products as retailProducts,
  orders as retailOrders,
  customers as retailCustomers,
  campaigns as retailCampaigns,
  stores as retailStores,
  inventory as retailInventory,
} from "@/lib/mock-retail";

export type BadgeVariant = "default" | "success" | "warning" | "destructive" | "recruiting" | "outline";
export type ColumnType = "text" | "badge" | "currency" | "date" | "number";

export interface ColumnDef {
  key: string;
  label: string;
  type?: ColumnType;
}

export interface FilterDef {
  key: string;
  label: string;
}

export interface Kpi {
  label: string;
  value: number | string;
  tone?: "violet" | "emerald" | "amber" | "blue" | "red" | "slate";
}

export type Row = Record<string, string | number>;

export interface WorkflowDef {
  statusKey: string;
  pending: string;
  approve: string;
  reject: string;
}

export interface ModuleConfig {
  title: string;
  breadcrumbs: string[];
  addLabel?: string;
  searchKeys: string[];
  columns: ColumnDef[];
  filters?: FilterDef[];
  badgeMap?: Record<string, BadgeVariant>;
  rows: Row[];
  kpis?: (rows: Row[]) => Kpi[];
  workflow?: WorkflowDef;
}

const count = (rows: Row[], key: string, val: string) => rows.filter((r) => r[key] === val).length;
const sum = (rows: Row[], key: string) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);

export const moduleConfigs: Record<string, ModuleConfig> = {
  // ===== Retail & Operations =====
  products: {
    title: "สินค้า", breadcrumbs: ["Retail", "สินค้า"], addLabel: "เพิ่มสินค้า",
    searchKeys: ["sku", "name", "collection"],
    columns: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "ชื่อสินค้า" },
      { key: "category", label: "หมวด", type: "badge" },
      { key: "collection", label: "คอลเลกชั่น" },
      { key: "price", label: "ราคา", type: "currency" },
      { key: "stock", label: "สต๊อก", type: "number" },
      { key: "sold", label: "ขายแล้ว", type: "number" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "category", label: "หมวด" }, { key: "status", label: "สถานะ" }, { key: "collection", label: "คอลเลกชั่น" }],
    badgeMap: {
      "เดนิม": "recruiting", "สตรี": "default", "Accessories": "warning", "Lifestyle": "outline",
      "ขายดี": "success", "ปกติ": "outline", "สต๊อกต่ำ": "warning", "หมดสต๊อก": "destructive", "ค้างสต๊อก": "destructive",
    },
    rows: retailProducts,
    kpis: (r) => [
      { label: "SKU ทั้งหมด", value: r.length, tone: "violet" },
      { label: "ขายแล้วรวม", value: sum(r, "sold").toLocaleString(), tone: "emerald" },
      { label: "สต๊อกต่ำ/หมด", value: count(r, "status", "สต๊อกต่ำ") + count(r, "status", "หมดสต๊อก"), tone: "amber" },
      { label: "มูลค่าสต๊อก", value: r.reduce((s, x) => s + Number(x.price) * Number(x.stock), 0).toLocaleString(), tone: "blue" },
    ],
  },

  orders: {
    title: "คำสั่งซื้อ", breadcrumbs: ["Retail", "คำสั่งซื้อ"], addLabel: "สร้างออเดอร์",
    searchKeys: ["orderNo", "customer"],
    columns: [
      { key: "orderNo", label: "เลขออเดอร์" },
      { key: "customer", label: "ลูกค้า" },
      { key: "channel", label: "ช่องทาง", type: "badge" },
      { key: "items", label: "ชิ้น", type: "number" },
      { key: "total", label: "ยอดรวม", type: "currency" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "channel", label: "ช่องทาง" }],
    badgeMap: {
      "หน้าร้าน": "default", "ออนไลน์": "recruiting", "Marketplace": "warning", "Wholesale": "outline",
      "รอชำระ": "warning", "ชำระแล้ว": "recruiting", "รอแพ็ก": "default", "กำลังจัดส่ง": "warning", "ส่งสำเร็จ": "success", "ยกเลิก": "destructive",
    },
    rows: retailOrders,
    kpis: (r) => [
      { label: "ออเดอร์ทั้งหมด", value: r.length, tone: "violet" },
      { label: "ยอดขายรวม", value: sum(r, "total").toLocaleString(), tone: "emerald" },
      { label: "รอแพ็ก/จัดส่ง", value: count(r, "status", "รอแพ็ก") + count(r, "status", "กำลังจัดส่ง"), tone: "amber" },
      { label: "ยกเลิก", value: count(r, "status", "ยกเลิก"), tone: "red" },
    ],
  },

  customers: {
    title: "ลูกค้า", breadcrumbs: ["Retail", "ลูกค้า"], addLabel: "เพิ่มลูกค้า",
    searchKeys: ["name"],
    columns: [
      { key: "name", label: "ชื่อลูกค้า" },
      { key: "tier", label: "ระดับ", type: "badge" },
      { key: "orders", label: "ออเดอร์", type: "number" },
      { key: "spent", label: "ยอดสะสม", type: "currency" },
      { key: "channel", label: "ช่องทางหลัก", type: "badge" },
      { key: "lastOrder", label: "ซื้อล่าสุด", type: "date" },
    ],
    filters: [{ key: "tier", label: "ระดับ" }, { key: "channel", label: "ช่องทาง" }],
    badgeMap: {
      "VIP": "success", "Gold": "warning", "Silver": "outline", "New": "recruiting",
      "หน้าร้าน": "default", "ออนไลน์": "recruiting", "Marketplace": "warning",
    },
    rows: retailCustomers,
    kpis: (r) => [
      { label: "ลูกค้าทั้งหมด", value: r.length, tone: "violet" },
      { label: "VIP", value: count(r, "tier", "VIP"), tone: "amber" },
      { label: "ยอดสะสมรวม", value: sum(r, "spent").toLocaleString(), tone: "emerald" },
      { label: "ลูกค้าใหม่", value: count(r, "tier", "New"), tone: "blue" },
    ],
  },

  campaigns: {
    title: "แคมเปญ", breadcrumbs: ["Retail", "แคมเปญ"], addLabel: "สร้างแคมเปญ",
    searchKeys: ["name", "channel"],
    columns: [
      { key: "name", label: "แคมเปญ" },
      { key: "channel", label: "ช่องทาง", type: "badge" },
      { key: "budget", label: "งบ", type: "currency" },
      { key: "spent", label: "ใช้ไป", type: "currency" },
      { key: "revenue", label: "รายได้", type: "currency" },
      { key: "roas", label: "ROAS" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "channel", label: "ช่องทาง" }],
    badgeMap: {
      "Instagram": "recruiting", "TikTok": "default", "Email": "outline", "Facebook": "warning", "Google": "success", "Offline": "outline",
      "กำลังทำงาน": "success", "จบแล้ว": "outline", "ร่าง": "warning",
    },
    rows: retailCampaigns,
    kpis: (r) => [
      { label: "แคมเปญทั้งหมด", value: r.length, tone: "violet" },
      { label: "กำลังทำงาน", value: count(r, "status", "กำลังทำงาน"), tone: "emerald" },
      { label: "งบใช้ไปรวม", value: sum(r, "spent").toLocaleString(), tone: "amber" },
      { label: "รายได้รวม", value: sum(r, "revenue").toLocaleString(), tone: "blue" },
    ],
  },

  stores: {
    title: "สาขาค้าปลีก", breadcrumbs: ["Retail", "สาขาค้าปลีก"], addLabel: "เพิ่มสาขา",
    searchKeys: ["store", "location"],
    columns: [
      { key: "store", label: "สาขา" },
      { key: "type", label: "ประเภท", type: "badge" },
      { key: "location", label: "ที่ตั้ง" },
      { key: "hours", label: "เวลาเปิด" },
      { key: "tel", label: "โทร" },
      { key: "sales", label: "ยอดขาย", type: "currency" },
      { key: "target", label: "เป้า", type: "currency" },
      { key: "conversion", label: "Conversion" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "type", label: "ประเภท" }, { key: "status", label: "สถานะ" }],
    badgeMap: {
      "STORE": "recruiting", "Central Dept": "warning", "Pop-Up": "outline",
      "เกินเป้า": "success", "ต่ำกว่าเป้า": "warning",
    },
    rows: retailStores,
    kpis: (r) => [
      { label: "สาขาทั้งหมด", value: r.length, tone: "violet" },
      { label: "STORE / Dept / Pop-Up", value: `${count(r, "type", "STORE")}/${count(r, "type", "Central Dept")}/${count(r, "type", "Pop-Up")}`, tone: "blue" },
      { label: "ยอดขายรวม", value: sum(r, "sales").toLocaleString(), tone: "emerald" },
      { label: "ต่ำกว่าเป้า", value: count(r, "status", "ต่ำกว่าเป้า"), tone: "amber" },
    ],
  },

  inventory: {
    title: "สต๊อก & คลังสินค้า", breadcrumbs: ["Retail", "สต๊อก & คลังสินค้า"], addLabel: "เพิ่มรายการ",
    searchKeys: ["sku", "name"],
    columns: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "สินค้า" },
      { key: "location", label: "ที่จัดเก็บ" },
      { key: "onHand", label: "คงเหลือ", type: "number" },
      { key: "reserved", label: "จอง", type: "number" },
      { key: "reorder", label: "จุดสั่งซื้อ", type: "number" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "location", label: "ที่จัดเก็บ" }],
    badgeMap: { "ปกติ": "success", "ต้องสั่งเพิ่ม": "warning", "หมดสต๊อก": "destructive", "เกินจำเป็น": "outline" },
    rows: retailInventory,
    kpis: (r) => [
      { label: "SKU ในคลัง", value: r.length, tone: "violet" },
      { label: "คงเหลือรวม", value: sum(r, "onHand").toLocaleString(), tone: "blue" },
      { label: "ต้องสั่งเพิ่ม", value: count(r, "status", "ต้องสั่งเพิ่ม"), tone: "amber" },
      { label: "หมดสต๊อก", value: count(r, "status", "หมดสต๊อก"), tone: "red" },
    ],
  },

  // ===== บุคลากร =====
  departments: {
    title: "แผนก", breadcrumbs: ["บุคลากร", "แผนก"], addLabel: "เพิ่มแผนก",
    searchKeys: ["name", "code"],
    columns: [
      { key: "code", label: "รหัส" },
      { key: "name", label: "ชื่อแผนก" },
      { key: "employees", label: "พนักงาน", type: "number" },
      { key: "head", label: "หัวหน้าแผนก" },
    ],
    rows: departments.map((d) => ({
      code: d.code, name: d.name,
      employees: mockEmployees.filter((e) => e.departmentId === d.id).length,
      head: mockEmployees.find((e) => e.departmentId === d.id && /Manager|Director|CEO/.test(e.positionName))?.fullName ?? "—",
    })),
    kpis: (r) => [
      { label: "แผนกทั้งหมด", value: r.length, tone: "violet" },
      { label: "พนักงานรวม", value: sum(r, "employees"), tone: "blue" },
    ],
  },

  branches: {
    title: "สาขา", breadcrumbs: ["บุคลากร", "สาขา"], addLabel: "เพิ่มสาขา",
    searchKeys: ["name", "code"],
    columns: [
      { key: "code", label: "รหัส" },
      { key: "name", label: "ชื่อสาขา" },
      { key: "employees", label: "พนักงาน", type: "number" },
      { key: "type", label: "ประเภท", type: "badge" },
    ],
    badgeMap: { "สำนักงาน": "recruiting", "หน้าร้าน": "success", "คลังสินค้า": "warning" },
    rows: branches.map((b) => ({
      code: b.code, name: b.name,
      employees: mockEmployees.filter((e) => e.branchId === b.id).length,
      type: b.code === "HQ" ? "สำนักงาน" : b.code === "WH" ? "คลังสินค้า" : "หน้าร้าน",
    })),
    kpis: (r) => [
      { label: "สาขาทั้งหมด", value: r.length, tone: "violet" },
      { label: "หน้าร้าน", value: count(r, "type", "หน้าร้าน"), tone: "emerald" },
    ],
  },

  // ===== เวลา & การลา =====
  schedules: {
    title: "ตารางงาน", breadcrumbs: ["เวลา & การลา", "ตารางงาน"], addLabel: "เพิ่มกะ",
    searchKeys: ["employee", "shift"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "branch", label: "สาขา" },
      { key: "shift", label: "กะ", type: "badge" },
      { key: "time", label: "เวลา" },
      { key: "day", label: "วัน" },
    ],
    filters: [{ key: "shift", label: "กะ" }],
    badgeMap: { "เช้า": "recruiting", "บ่าย": "warning", "ดึก": "destructive", "OFF": "outline" },
    rows: [
      { employee: "กานต์ ดีใจ", branch: "Siam Center", shift: "เช้า", time: "10:00-19:00", day: "จ-ศ" },
      { employee: "มณี ส่องแสง", branch: "Mega Bangna", shift: "บ่าย", time: "13:00-22:00", day: "อ-ส" },
      { employee: "ธีรภัทร ขายเก่ง", branch: "Siam Square", shift: "เช้า", time: "10:00-19:00", day: "จ-ศ" },
      { employee: "ภูวนาท มั่นคง", branch: "Warehouse", shift: "เช้า", time: "08:00-17:00", day: "จ-ส" },
      { employee: "พิมพ์ใจ สวยงาม", branch: "Siam Square", shift: "OFF", time: "-", day: "อา" },
    ],
    kpis: (r) => [
      { label: "ตารางทั้งหมด", value: r.length, tone: "violet" },
      { label: "กะเช้า", value: count(r, "shift", "เช้า"), tone: "blue" },
      { label: "กะบ่าย", value: count(r, "shift", "บ่าย"), tone: "amber" },
    ],
  },

  attendance: {
    title: "บันทึกเวลา", breadcrumbs: ["เวลา & การลา", "บันทึกเวลา"], addLabel: "บันทึกเวลา",
    searchKeys: ["employee"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "checkIn", label: "เข้า" },
      { key: "checkOut", label: "ออก" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "ปกติ": "success", "สาย": "warning", "ขาด": "destructive", "ลา": "outline" },
    rows: [
      { employee: "กานต์ ดีใจ", date: "2026-06-10", checkIn: "09:58", checkOut: "19:02", status: "ปกติ" },
      { employee: "ธนกร ช่างคิด", date: "2026-06-10", checkIn: "09:15", checkOut: "18:05", status: "สาย" },
      { employee: "มณี ส่องแสง", date: "2026-06-10", checkIn: "13:02", checkOut: "22:10", status: "ปกติ" },
      { employee: "พิชัย ออกแบบ", date: "2026-06-10", checkIn: "-", checkOut: "-", status: "ลา" },
      { employee: "ภูวนาท มั่นคง", date: "2026-06-10", checkIn: "-", checkOut: "-", status: "ขาด" },
    ],
    kpis: (r) => [
      { label: "บันทึกวันนี้", value: r.length, tone: "violet" },
      { label: "มาปกติ", value: count(r, "status", "ปกติ"), tone: "emerald" },
      { label: "มาสาย", value: count(r, "status", "สาย"), tone: "amber" },
      { label: "ขาด/ลา", value: count(r, "status", "ขาด") + count(r, "status", "ลา"), tone: "red" },
    ],
  },

  leaves: {
    title: "การลา", breadcrumbs: ["เวลา & การลา", "การลา"], addLabel: "ขอลา",
    searchKeys: ["employee", "type"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "type", label: "ประเภท" },
      { key: "from", label: "ตั้งแต่", type: "date" },
      { key: "to", label: "ถึง", type: "date" },
      { key: "days", label: "วัน", type: "number" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "type", label: "ประเภท" }],
    badgeMap: { "อนุมัติ": "success", "รออนุมัติ": "warning", "ปฏิเสธ": "destructive" },
    workflow: { statusKey: "status", pending: "รออนุมัติ", approve: "อนุมัติ", reject: "ปฏิเสธ" },
    rows: [
      { employee: "พิชัย ออกแบบ", type: "ลาพักร้อน", from: "2026-06-10", to: "2026-06-14", days: 5, status: "อนุมัติ" },
      { employee: "ณัฐพล มีสุข", type: "ลาป่วย", from: "2026-06-11", to: "2026-06-11", days: 1, status: "รออนุมัติ" },
      { employee: "ชลิตา งามพร้อม", type: "ลากิจ", from: "2026-06-15", to: "2026-06-16", days: 2, status: "รออนุมัติ" },
      { employee: "กานต์ ดีใจ", type: "ลาพักร้อน", from: "2026-06-20", to: "2026-06-22", days: 3, status: "ปฏิเสธ" },
    ],
    kpis: (r) => [
      { label: "คำขอทั้งหมด", value: r.length, tone: "violet" },
      { label: "รออนุมัติ", value: count(r, "status", "รออนุมัติ"), tone: "amber" },
      { label: "อนุมัติแล้ว", value: count(r, "status", "อนุมัติ"), tone: "emerald" },
    ],
  },

  // ===== การเงิน =====
  payroll: {
    title: "เงินเดือน", breadcrumbs: ["การเงิน", "เงินเดือน"], addLabel: "สร้างรอบจ่าย",
    searchKeys: ["employee"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "base", label: "เงินเดือน", type: "currency" },
      { key: "ot", label: "OT", type: "currency" },
      { key: "deduct", label: "หัก", type: "currency" },
      { key: "net", label: "สุทธิ", type: "currency" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "จ่ายแล้ว": "success", "รอจ่าย": "warning" },
    rows: [
      { employee: "ปวิตร วงศ์สุวรรณ", base: 350000, ot: 0, deduct: 35000, net: 315000, status: "รอจ่าย" },
      { employee: "สมชาย ใจดี", base: 80000, ot: 0, deduct: 8000, net: 72000, status: "รอจ่าย" },
      { employee: "กานต์ ดีใจ", base: 22000, ot: 3500, deduct: 1200, net: 24300, status: "จ่ายแล้ว" },
      { employee: "ภูวนาท มั่นคง", base: 18000, ot: 2800, deduct: 900, net: 19900, status: "จ่ายแล้ว" },
    ],
    kpis: (r) => [
      { label: "ยอดจ่ายสุทธิ", value: sum(r, "net").toLocaleString(), tone: "violet" },
      { label: "OT รวม", value: sum(r, "ot").toLocaleString(), tone: "amber" },
      { label: "รอจ่าย", value: count(r, "status", "รอจ่าย"), tone: "red" },
    ],
  },

  overtime: {
    title: "OT", breadcrumbs: ["การเงิน", "OT"], addLabel: "บันทึก OT",
    searchKeys: ["employee"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "hours", label: "ชั่วโมง", type: "number" },
      { key: "rate", label: "เรท/ชม.", type: "currency" },
      { key: "amount", label: "รวม", type: "currency" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "อนุมัติ": "success", "รออนุมัติ": "warning", "ปฏิเสธ": "destructive" },
    workflow: { statusKey: "status", pending: "รออนุมัติ", approve: "อนุมัติ", reject: "ปฏิเสธ" },
    rows: [
      { employee: "กานต์ ดีใจ", date: "2026-06-08", hours: 3, rate: 150, amount: 450, status: "อนุมัติ" },
      { employee: "ภูวนาท มั่นคง", date: "2026-06-09", hours: 2, rate: 120, amount: 240, status: "รออนุมัติ" },
      { employee: "มณี ส่องแสง", date: "2026-06-09", hours: 4, rate: 150, amount: 600, status: "รออนุมัติ" },
    ],
    kpis: (r) => [
      { label: "รายการ OT", value: r.length, tone: "violet" },
      { label: "ชั่วโมงรวม", value: sum(r, "hours"), tone: "blue" },
      { label: "ยอดรวม", value: sum(r, "amount").toLocaleString(), tone: "amber" },
    ],
  },

  commission: {
    title: "ค่าคอมมิชชั่น", breadcrumbs: ["การเงิน", "ค่าคอมมิชชั่น"], addLabel: "เพิ่มรายการ",
    searchKeys: ["employee", "branch"],
    columns: [
      { key: "employee", label: "พนักงานขาย" },
      { key: "branch", label: "สาขา" },
      { key: "sales", label: "ยอดขาย", type: "currency" },
      { key: "rate", label: "%", type: "text" },
      { key: "commission", label: "คอมมิชชั่น", type: "currency" },
    ],
    filters: [{ key: "branch", label: "สาขา" }],
    rows: [
      { employee: "ธีรภัทร ขายเก่ง", branch: "Siam Square", sales: 850000, rate: "3%", commission: 25500 },
      { employee: "กานต์ ดีใจ", branch: "Siam Center", sales: 420000, rate: "3%", commission: 12600 },
      { employee: "มณี ส่องแสง", branch: "Mega Bangna", sales: 380000, rate: "3%", commission: 11400 },
    ],
    kpis: (r) => [
      { label: "ยอดขายรวม", value: sum(r, "sales").toLocaleString(), tone: "violet" },
      { label: "คอมมิชชั่นรวม", value: sum(r, "commission").toLocaleString(), tone: "emerald" },
    ],
  },

  expenses: {
    title: "เบิกค่าใช้จ่าย", breadcrumbs: ["การเงิน", "เบิกค่าใช้จ่าย"], addLabel: "ขอเบิก",
    searchKeys: ["employee", "category"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "category", label: "ประเภท" },
      { key: "amount", label: "จำนวน", type: "currency" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "category", label: "ประเภท" }],
    badgeMap: { "อนุมัติ": "success", "รออนุมัติ": "warning", "ปฏิเสธ": "destructive" },
    workflow: { statusKey: "status", pending: "รออนุมัติ", approve: "อนุมัติ", reject: "ปฏิเสธ" },
    rows: [
      { employee: "อรทัย พิมพ์ใจ", category: "อุปกรณ์ IT", amount: 12500, date: "2026-06-05", status: "อนุมัติ" },
      { employee: "ศิริ สร้างสรรค์", category: "ค่าเดินทาง", amount: 3200, date: "2026-06-07", status: "รออนุมัติ" },
      { employee: "วิชัย จัดหา", category: "ตัวอย่างสินค้า", amount: 8900, date: "2026-06-08", status: "รออนุมัติ" },
    ],
    kpis: (r) => [
      { label: "คำขอทั้งหมด", value: r.length, tone: "violet" },
      { label: "ยอดรออนุมัติ", value: sum(r.filter((x) => x.status === "รออนุมัติ"), "amount").toLocaleString(), tone: "amber" },
    ],
  },

  "purchase-requests": {
    title: "ขอซื้อของ", breadcrumbs: ["จัดซื้อ", "ขอซื้อของ"], addLabel: "เปิดคำขอซื้อ",
    searchKeys: ["code", "item", "requester", "department"],
    columns: [
      { key: "code", label: "เลขที่" },
      { key: "item", label: "รายการที่ขอซื้อ" },
      { key: "qty", label: "จำนวน", type: "number" },
      { key: "estPrice", label: "งบประมาณ", type: "currency" },
      { key: "requester", label: "ผู้ขอ" },
      { key: "department", label: "แผนก" },
      { key: "date", label: "วันที่ขอ", type: "date" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }, { key: "department", label: "แผนก" }],
    badgeMap: { "อนุมัติ": "success", "รออนุมัติ": "warning", "ปฏิเสธ": "destructive" },
    workflow: { statusKey: "status", pending: "รออนุมัติ", approve: "อนุมัติ", reject: "ปฏิเสธ" },
    rows: [
      { code: "PR-2026-001", item: "MacBook Pro 14\" M4 (ทีม Design)", qty: 2, estPrice: 150000, requester: "รัตนา จันทร์ฉาย", department: "Design", date: "2026-06-08", status: "รออนุมัติ" },
      { code: "PR-2026-002", item: "กล้อง CCTV IP 4K + NVR สาขา Mega Bangna", qty: 8, estPrice: 85000, requester: "ธีรภัทร วงศ์ทอง", department: "ขาย", date: "2026-06-06", status: "อนุมัติ" },
      { code: "PR-2026-003", item: "Uniform + ป้ายชื่อ พนักงานใหม่ Central Westgate", qty: 12, estPrice: 36000, requester: "ธีรภัทร วงศ์ทอง", department: "ขาย", date: "2026-06-09", status: "รออนุมัติ" },
      { code: "PR-2026-004", item: "POS System + อุปกรณ์ สาขา The Mall Bangkapi", qty: 1, estPrice: 120000, requester: "อรทัย พิมพ์ใจ", department: "IT", date: "2026-06-05", status: "อนุมัติ" },
      { code: "PR-2026-005", item: "ตัวอย่างผ้า collection Summer 2026", qty: 30, estPrice: 8900, requester: "วิชัย จัดหา", department: "จัดซื้อ", date: "2026-06-07", status: "รออนุมัติ" },
      { code: "PR-2026-006", item: "วัสดุสำนักงาน + หมึกพิมพ์ ไตรมาส 2", qty: 1, estPrice: 5500, requester: "พัชรี สุขใจ", department: "HR", date: "2026-06-02", status: "อนุมัติ" },
      { code: "PR-2026-007", item: "เครื่องปรับอากาศ 18,000 BTU สาขา Fashion Island", qty: 2, estPrice: 44000, requester: "ปรีชา มั่นคง", department: "สต๊อก", date: "2026-06-10", status: "ปฏิเสธ" },
    ],
    kpis: (r) => [
      { label: "คำขอทั้งหมด", value: r.length, tone: "violet" },
      { label: "รออนุมัติ", value: count(r, "status", "รออนุมัติ"), tone: "amber" },
      { label: "งบรออนุมัติ", value: sum(r.filter((x) => x.status === "รออนุมัติ"), "estPrice").toLocaleString(), tone: "blue" },
    ],
  },

  // ===== สรรหา =====
  recruitment: {
    title: "สรรหา", breadcrumbs: ["สรรหา", "สรรหา"], addLabel: "เปิดรับสมัคร",
    searchKeys: ["position", "department"],
    columns: [
      { key: "position", label: "ตำแหน่ง" },
      { key: "department", label: "แผนก" },
      { key: "openings", label: "อัตรา", type: "number" },
      { key: "applicants", label: "ผู้สมัคร", type: "number" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "เปิดรับ": "recruiting", "สัมภาษณ์": "warning", "ปิดรับ": "outline" },
    rows: [
      { position: "Sales Officer", department: "ขาย", openings: 3, applicants: 12, status: "เปิดรับ" },
      { position: "Graphic Designer", department: "Design", openings: 1, applicants: 8, status: "สัมภาษณ์" },
      { position: "Stock Officer", department: "สต๊อก", openings: 2, applicants: 5, status: "เปิดรับ" },
      { position: "Accountant", department: "บัญชี", openings: 1, applicants: 4, status: "ปิดรับ" },
    ],
    kpis: (r) => [
      { label: "ตำแหน่งเปิดรับ", value: count(r, "status", "เปิดรับ"), tone: "violet" },
      { label: "อัตรารวม", value: sum(r, "openings"), tone: "blue" },
      { label: "ผู้สมัครรวม", value: sum(r, "applicants"), tone: "emerald" },
    ],
  },

  applicants: {
    title: "ผู้สมัคร", breadcrumbs: ["สรรหา", "ผู้สมัคร"], addLabel: "เพิ่มผู้สมัคร",
    searchKeys: ["name", "position"],
    columns: [
      { key: "name", label: "ชื่อ" },
      { key: "position", label: "สมัครตำแหน่ง" },
      { key: "exp", label: "ประสบการณ์" },
      { key: "applied", label: "วันที่สมัคร", type: "date" },
      { key: "stage", label: "ขั้นตอน", type: "badge" },
    ],
    filters: [{ key: "stage", label: "ขั้นตอน" }],
    badgeMap: { "คัดกรอง": "outline", "สัมภาษณ์": "warning", "เสนอจ้าง": "recruiting", "ผ่าน": "success", "ไม่ผ่าน": "destructive" },
    rows: [
      { name: "ธิดา ใจงาม", position: "Sales Officer", exp: "2 ปี", applied: "2026-06-01", stage: "สัมภาษณ์" },
      { name: "ก้อง รุ่งโรจน์", position: "Graphic Designer", exp: "4 ปี", applied: "2026-06-02", stage: "เสนอจ้าง" },
      { name: "พลอย สดใส", position: "Sales Officer", exp: "1 ปี", applied: "2026-06-03", stage: "คัดกรอง" },
      { name: "ชาติ มั่งมี", position: "Accountant", exp: "5 ปี", applied: "2026-05-28", stage: "ผ่าน" },
      { name: "นภา ฟ้าใส", position: "Stock Officer", exp: "0 ปี", applied: "2026-06-05", stage: "ไม่ผ่าน" },
    ],
    kpis: (r) => [
      { label: "ผู้สมัครทั้งหมด", value: r.length, tone: "violet" },
      { label: "รอบสัมภาษณ์", value: count(r, "stage", "สัมภาษณ์"), tone: "amber" },
      { label: "ผ่านแล้ว", value: count(r, "stage", "ผ่าน"), tone: "emerald" },
    ],
  },

  onboarding: {
    title: "Onboarding", breadcrumbs: ["สรรหา", "Onboarding"], addLabel: "เพิ่มพนักงานใหม่",
    searchKeys: ["name", "position"],
    columns: [
      { key: "name", label: "พนักงานใหม่" },
      { key: "position", label: "ตำแหน่ง" },
      { key: "startDate", label: "วันเริ่ม", type: "date" },
      { key: "progress", label: "ความคืบหน้า" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "กำลังดำเนินการ": "warning", "เสร็จสิ้น": "success", "รอเริ่ม": "outline" },
    rows: [
      { name: "ชาติ มั่งมี", position: "Accountant", startDate: "2026-06-15", progress: "3/8 ขั้นตอน", status: "กำลังดำเนินการ" },
      { name: "ก้อง รุ่งโรจน์", position: "Graphic Designer", startDate: "2026-06-20", progress: "0/8 ขั้นตอน", status: "รอเริ่ม" },
      { name: "ดารา เด่นชัย", position: "Sales Officer", startDate: "2026-05-01", progress: "8/8 ขั้นตอน", status: "เสร็จสิ้น" },
    ],
    kpis: (r) => [
      { label: "พนักงานใหม่", value: r.length, tone: "violet" },
      { label: "กำลังดำเนินการ", value: count(r, "status", "กำลังดำเนินการ"), tone: "amber" },
    ],
  },

  // ===== พัฒนาบุคลากร =====
  training: {
    title: "อบรม", breadcrumbs: ["พัฒนาบุคลากร", "อบรม"], addLabel: "สร้างหลักสูตร",
    searchKeys: ["course", "trainer"],
    columns: [
      { key: "course", label: "หลักสูตร" },
      { key: "trainer", label: "ผู้สอน" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "seats", label: "ที่นั่ง", type: "number" },
      { key: "enrolled", label: "ลงทะเบียน", type: "number" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "เปิดรับ": "recruiting", "เต็ม": "warning", "จบแล้ว": "success" },
    rows: [
      { course: "Visual Merchandising", trainer: "ศิริ สร้างสรรค์", date: "2026-06-18", seats: 20, enrolled: 15, status: "เปิดรับ" },
      { course: "บริการลูกค้าระดับพรีเมียม", trainer: "ธีรภัทร ขายเก่ง", date: "2026-06-25", seats: 30, enrolled: 30, status: "เต็ม" },
      { course: "ระบบ POS ใหม่", trainer: "อรทัย พิมพ์ใจ", date: "2026-05-30", seats: 25, enrolled: 22, status: "จบแล้ว" },
    ],
    kpis: (r) => [
      { label: "หลักสูตร", value: r.length, tone: "violet" },
      { label: "ผู้ลงทะเบียนรวม", value: sum(r, "enrolled"), tone: "blue" },
    ],
  },

  evaluation: {
    title: "ประเมินผล", breadcrumbs: ["พัฒนาบุคลากร", "ประเมินผล"], addLabel: "เริ่มรอบประเมิน",
    searchKeys: ["employee"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "period", label: "รอบ" },
      { key: "score", label: "คะแนน" },
      { key: "grade", label: "เกรด", type: "badge" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "grade", label: "เกรด" }],
    badgeMap: { "A": "success", "B": "recruiting", "C": "warning", "D": "destructive", "เสร็จสิ้น": "success", "รอประเมิน": "warning" },
    rows: [
      { employee: "กานต์ ดีใจ", period: "H1/2026", score: "92/100", grade: "A", status: "เสร็จสิ้น" },
      { employee: "ธนกร ช่างคิด", period: "H1/2026", score: "78/100", grade: "B", status: "เสร็จสิ้น" },
      { employee: "ภูวนาท มั่นคง", period: "H1/2026", score: "65/100", grade: "C", status: "รอประเมิน" },
    ],
    kpis: (r) => [
      { label: "พนักงานประเมิน", value: r.length, tone: "violet" },
      { label: "เกรด A", value: count(r, "grade", "A"), tone: "emerald" },
      { label: "รอประเมิน", value: count(r, "status", "รอประเมิน"), tone: "amber" },
    ],
  },

  okr: {
    title: "OKR", breadcrumbs: ["พัฒนาบุคลากร", "OKR"], addLabel: "เพิ่ม Objective",
    searchKeys: ["objective", "owner"],
    columns: [
      { key: "objective", label: "Objective" },
      { key: "owner", label: "ผู้รับผิดชอบ" },
      { key: "quarter", label: "ไตรมาส" },
      { key: "progress", label: "ความคืบหน้า" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "On Track": "success", "At Risk": "warning", "Behind": "destructive" },
    rows: [
      { objective: "เพิ่มยอดขายออนไลน์ 40%", owner: "ธีรภัทร ขายเก่ง", quarter: "Q3/2026", progress: "65%", status: "On Track" },
      { objective: "ลด stock dead 25%", owner: "ปรีชา สต็อกดี", quarter: "Q3/2026", progress: "30%", status: "At Risk" },
      { objective: "เปิดสาขาใหม่ 2 แห่ง", owner: "อรรถพล รุ่งเรือง", quarter: "Q3/2026", progress: "10%", status: "Behind" },
    ],
    kpis: (r) => [
      { label: "Objectives", value: r.length, tone: "violet" },
      { label: "On Track", value: count(r, "status", "On Track"), tone: "emerald" },
      { label: "At Risk / Behind", value: count(r, "status", "At Risk") + count(r, "status", "Behind"), tone: "red" },
    ],
  },

  // ===== ทรัพยากร =====
  documents: {
    title: "เอกสาร HR", breadcrumbs: ["ทรัพยากร", "เอกสาร HR"], addLabel: "อัปโหลดเอกสาร",
    searchKeys: ["name", "category"],
    columns: [
      { key: "name", label: "ชื่อเอกสาร" },
      { key: "category", label: "หมวดหมู่", type: "badge" },
      { key: "owner", label: "เจ้าของ" },
      { key: "updated", label: "อัปเดต", type: "date" },
    ],
    filters: [{ key: "category", label: "หมวดหมู่" }],
    badgeMap: { "นโยบาย": "recruiting", "สัญญา": "warning", "แบบฟอร์ม": "outline", "คู่มือ": "success" },
    rows: [
      { name: "ระเบียบพนักงาน 2026", category: "นโยบาย", owner: "สมชาย ใจดี", updated: "2026-01-15" },
      { name: "สัญญาจ้างมาตรฐาน", category: "สัญญา", owner: "พัชรี สุขสวัสดิ์", updated: "2026-03-01" },
      { name: "แบบฟอร์มขอลา", category: "แบบฟอร์ม", owner: "พัชรี สุขสวัสดิ์", updated: "2026-02-10" },
      { name: "คู่มือพนักงานขาย", category: "คู่มือ", owner: "ธีรภัทร ขายเก่ง", updated: "2026-04-20" },
    ],
    kpis: (r) => [
      { label: "เอกสารทั้งหมด", value: r.length, tone: "violet" },
    ],
  },

  assets: {
    title: "ทรัพย์สิน", breadcrumbs: ["ทรัพยากร", "ทรัพย์สิน"], addLabel: "เพิ่มทรัพย์สิน",
    searchKeys: ["name", "assignedTo"],
    columns: [
      { key: "code", label: "รหัส" },
      { key: "name", label: "ทรัพย์สิน" },
      { key: "assignedTo", label: "ผู้ถือครอง" },
      { key: "value", label: "มูลค่า", type: "currency" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "ใช้งาน": "success", "ว่าง": "outline", "ซ่อม": "warning", "จำหน่าย": "destructive" },
    rows: [
      { code: "AST-001", name: "MacBook Pro 16\"", assignedTo: "อรทัย พิมพ์ใจ", value: 89000, status: "ใช้งาน" },
      { code: "AST-002", name: "iMac 27\"", assignedTo: "ศิริ สร้างสรรค์", value: 75000, status: "ใช้งาน" },
      { code: "AST-003", name: "เครื่อง POS", assignedTo: "Siam Square", value: 35000, status: "ซ่อม" },
      { code: "AST-004", name: "iPad Pro", assignedTo: "-", value: 32000, status: "ว่าง" },
    ],
    kpis: (r) => [
      { label: "ทรัพย์สินทั้งหมด", value: r.length, tone: "violet" },
      { label: "มูลค่ารวม", value: sum(r, "value").toLocaleString(), tone: "blue" },
      { label: "รอซ่อม", value: count(r, "status", "ซ่อม"), tone: "amber" },
    ],
  },

  benefits: {
    title: "สวัสดิการ", breadcrumbs: ["ทรัพยากร", "สวัสดิการ"], addLabel: "เพิ่มสวัสดิการ",
    searchKeys: ["name"],
    columns: [
      { key: "name", label: "สวัสดิการ" },
      { key: "scope", label: "สำหรับ" },
      { key: "value", label: "มูลค่า/ปี", type: "currency" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    badgeMap: { "ใช้งาน": "success", "ระงับ": "outline" },
    rows: [
      { name: "ประกันสุขภาพกลุ่ม", scope: "พนักงานประจำ", value: 15000, status: "ใช้งาน" },
      { name: "ส่วนลดพนักงาน 30%", scope: "ทุกคน", value: 0, status: "ใช้งาน" },
      { name: "โบนัสประจำปี", scope: "พนักงานประจำ", value: 0, status: "ใช้งาน" },
      { name: "ค่าเดินทาง", scope: "พนักงานขาย", value: 12000, status: "ใช้งาน" },
    ],
    kpis: (r) => [
      { label: "สวัสดิการทั้งหมด", value: r.length, tone: "violet" },
      { label: "เปิดใช้งาน", value: count(r, "status", "ใช้งาน"), tone: "emerald" },
    ],
  },

  "social-security": {
    title: "ประกันสังคม", breadcrumbs: ["ทรัพยากร", "ประกันสังคม"], addLabel: "ยื่นข้อมูล",
    searchKeys: ["employee"],
    columns: [
      { key: "employee", label: "พนักงาน" },
      { key: "ssn", label: "เลขประกันสังคม" },
      { key: "contribution", label: "เงินสมทบ/เดือน", type: "currency" },
      { key: "hospital", label: "โรงพยาบาล" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "status", label: "สถานะ" }],
    badgeMap: { "ขึ้นทะเบียน": "success", "รอยื่น": "warning" },
    rows: [
      { employee: "กานต์ ดีใจ", ssn: "1-2345-xxxxx-67", contribution: 750, hospital: "รพ.กรุงเทพ", status: "ขึ้นทะเบียน" },
      { employee: "ภูวนาท มั่นคง", ssn: "1-2345-xxxxx-89", contribution: 750, hospital: "รพ.บางนา", status: "ขึ้นทะเบียน" },
      { employee: "ชาติ มั่งมี", ssn: "-", contribution: 0, hospital: "-", status: "รอยื่น" },
    ],
    kpis: (r) => [
      { label: "ขึ้นทะเบียนแล้ว", value: count(r, "status", "ขึ้นทะเบียน"), tone: "emerald" },
      { label: "รอยื่น", value: count(r, "status", "รอยื่น"), tone: "amber" },
    ],
  },

  // ===== สื่อสาร & รายงาน =====
  announcements: {
    title: "ประกาศ", breadcrumbs: ["สื่อสาร & รายงาน", "ประกาศ"], addLabel: "สร้างประกาศ",
    searchKeys: ["title"],
    columns: [
      { key: "title", label: "หัวข้อ" },
      { key: "audience", label: "กลุ่มเป้าหมาย" },
      { key: "date", label: "วันที่", type: "date" },
      { key: "priority", label: "ความสำคัญ", type: "badge" },
    ],
    filters: [{ key: "priority", label: "ความสำคัญ" }],
    badgeMap: { "ด่วน": "destructive", "ปกติ": "outline", "สำคัญ": "warning" },
    rows: [
      { title: "หยุดยาวเทศกาลกลางปี", audience: "ทุกคน", date: "2026-06-09", priority: "สำคัญ" },
      { title: "เปิดตัวคอลเลคชัน Summer", audience: "ทีมขาย", date: "2026-06-07", priority: "ปกติ" },
      { title: "ระบบ POS ปิดปรับปรุง", audience: "หน้าร้าน", date: "2026-06-10", priority: "ด่วน" },
    ],
    kpis: (r) => [
      { label: "ประกาศทั้งหมด", value: r.length, tone: "violet" },
      { label: "ด่วน", value: count(r, "priority", "ด่วน"), tone: "red" },
    ],
  },

  reports: {
    title: "รายงาน", breadcrumbs: ["สื่อสาร & รายงาน", "รายงาน"], addLabel: "สร้างรายงาน",
    searchKeys: ["name", "category"],
    columns: [
      { key: "name", label: "รายงาน" },
      { key: "category", label: "หมวด", type: "badge" },
      { key: "period", label: "รอบ" },
      { key: "updated", label: "อัปเดต", type: "date" },
    ],
    filters: [{ key: "category", label: "หมวด" }],
    badgeMap: { "บุคลากร": "recruiting", "การเงิน": "success", "ขาย": "warning" },
    rows: [
      { name: "สรุปกำลังพลรายเดือน", category: "บุคลากร", period: "มิ.ย. 2026", updated: "2026-06-09" },
      { name: "Turnover Rate", category: "บุคลากร", period: "Q2/2026", updated: "2026-06-01" },
      { name: "สรุปเงินเดือน", category: "การเงิน", period: "พ.ค. 2026", updated: "2026-06-05" },
      { name: "ยอดขายรายสาขา", category: "ขาย", period: "มิ.ย. 2026", updated: "2026-06-10" },
    ],
    kpis: (r) => [
      { label: "รายงานทั้งหมด", value: r.length, tone: "violet" },
    ],
  },

  // ===== ระบบ =====
  users: {
    title: "จัดการผู้ใช้", breadcrumbs: ["ระบบ", "จัดการผู้ใช้"], addLabel: "เพิ่มผู้ใช้",
    searchKeys: ["name", "email"],
    columns: [
      { key: "name", label: "ชื่อ" },
      { key: "email", label: "อีเมล" },
      { key: "role", label: "บทบาท", type: "badge" },
      { key: "lastLogin", label: "เข้าใช้ล่าสุด", type: "date" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "role", label: "บทบาท" }, { key: "status", label: "สถานะ" }],
    badgeMap: { "Super Admin": "destructive", "HR Admin": "recruiting", "Manager": "warning", "User": "outline", "เปิดใช้งาน": "success", "ระงับ": "outline" },
    rows: [
      { name: "System Admin", email: "admin@senseasia.com", role: "Super Admin", lastLogin: "2026-06-10", status: "เปิดใช้งาน" },
      { name: "สมชาย ใจดี", email: "somchai@senseasia.com", role: "HR Admin", lastLogin: "2026-06-09", status: "เปิดใช้งาน" },
      { name: "ธีรภัทร ขายเก่ง", email: "teeraphath@senseasia.com", role: "Manager", lastLogin: "2026-06-08", status: "เปิดใช้งาน" },
      { name: "กานต์ ดีใจ", email: "karn@senseasia.com", role: "User", lastLogin: "2026-05-20", status: "ระงับ" },
    ],
    kpis: (r) => [
      { label: "ผู้ใช้ทั้งหมด", value: r.length, tone: "violet" },
      { label: "เปิดใช้งาน", value: count(r, "status", "เปิดใช้งาน"), tone: "emerald" },
      { label: "Admin", value: count(r, "role", "Super Admin") + count(r, "role", "HR Admin"), tone: "blue" },
    ],
  },

  settings: {
    title: "ตั้งค่า", breadcrumbs: ["ระบบ", "ตั้งค่า"], addLabel: "เพิ่มการตั้งค่า",
    searchKeys: ["name"],
    columns: [
      { key: "name", label: "การตั้งค่า" },
      { key: "category", label: "หมวด" },
      { key: "value", label: "ค่า" },
      { key: "status", label: "สถานะ", type: "badge" },
    ],
    filters: [{ key: "category", label: "หมวด" }],
    badgeMap: { "เปิด": "success", "ปิด": "outline" },
    rows: [
      { name: "ชื่อบริษัท", category: "ทั่วไป", value: "SENSE ASIA CORPORATION", status: "เปิด" },
      { name: "เขตเวลา", category: "ทั่วไป", value: "Asia/Bangkok (GMT+7)", status: "เปิด" },
      { name: "แจ้งเตือนอีเมล", category: "การแจ้งเตือน", value: "เปิดใช้งาน", status: "เปิด" },
      { name: "2FA สำหรับ Admin", category: "ความปลอดภัย", value: "บังคับ", status: "เปิด" },
      { name: "Maintenance Mode", category: "ระบบ", value: "ปิดอยู่", status: "ปิด" },
    ],
    kpis: (r) => [
      { label: "การตั้งค่าทั้งหมด", value: r.length, tone: "violet" },
      { label: "เปิดใช้งาน", value: count(r, "status", "เปิด"), tone: "emerald" },
    ],
  },
};
