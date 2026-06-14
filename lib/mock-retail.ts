// Mock retail/operations data for MERGE Fashion — shared by retail modules + Ops dashboard.
// Categories follow brand focus: เดนิม / สตรี / Accessories / Lifestyle.

export type RetailRow = Record<string, string | number>;

export const productCategories = ["เดนิม", "สตรี", "Accessories", "Lifestyle"] as const;
export const salesChannels = ["หน้าร้าน", "ออนไลน์", "Marketplace", "Wholesale"] as const;

// ===== Products (Product Performance) =====
export const products: RetailRow[] = [
  { sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", collection: "Summer 26", price: 2890, stock: 142, sold: 318, status: "ขายดี" },
  { sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", collection: "Summer 26", price: 3290, stock: 86, sold: 204, status: "ขายดี" },
  { sku: "MRG-DNM-003", name: "Cropped Denim Jacket", category: "เดนิม", collection: "Spring 26", price: 3990, stock: 24, sold: 156, status: "สต๊อกต่ำ" },
  { sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", collection: "Summer 26", price: 4290, stock: 58, sold: 142, status: "ปกติ" },
  { sku: "MRG-WMN-011", name: "Linen Wrap Blouse", category: "สตรี", collection: "Summer 26", price: 1990, stock: 0, sold: 220, status: "หมดสต๊อก" },
  { sku: "MRG-WMN-012", name: "Tailored Wide Trousers", category: "สตรี", collection: "Spring 26", price: 2590, stock: 94, sold: 88, status: "ปกติ" },
  { sku: "MRG-WMN-013", name: "Oversized Knit Sweater", category: "สตรี", collection: "Winter 25", price: 2890, stock: 188, sold: 41, status: "ค้างสต๊อก" },
  { sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", collection: "Summer 26", price: 5990, stock: 32, sold: 178, status: "ขายดี" },
  { sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", collection: "Summer 26", price: 890, stock: 210, sold: 264, status: "ขายดี" },
  { sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", collection: "Spring 26", price: 1290, stock: 18, sold: 96, status: "สต๊อกต่ำ" },
  { sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", collection: "Permanent", price: 1490, stock: 120, sold: 132, status: "ปกติ" },
  { sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", collection: "Permanent", price: 990, stock: 76, sold: 154, status: "ปกติ" },
];

// ===== Orders (Order Tracking) =====
export const orders: RetailRow[] = [
  { orderNo: "MRG260610-1042", customer: "ณิชา ภักดี", channel: "ออนไลน์", items: 3, total: 8170, date: "2026-06-10", status: "รอแพ็ก" },
  { orderNo: "MRG260610-1041", customer: "Sarah Tan", channel: "Marketplace", items: 1, total: 5990, date: "2026-06-10", status: "ชำระแล้ว" },
  { orderNo: "MRG260610-1040", customer: "พิมพ์มาดา ศรี", channel: "หน้าร้าน", items: 2, total: 4880, date: "2026-06-10", status: "ส่งสำเร็จ" },
  { orderNo: "MRG260609-1039", customer: "ก้องภพ วัฒน์", channel: "ออนไลน์", items: 4, total: 11260, date: "2026-06-09", status: "กำลังจัดส่ง" },
  { orderNo: "MRG260609-1038", customer: "Yuki Tanaka", channel: "ออนไลน์", items: 1, total: 4290, date: "2026-06-09", status: "ส่งสำเร็จ" },
  { orderNo: "MRG260609-1037", customer: "ธัญชนก ผล", channel: "Wholesale", items: 24, total: 62400, date: "2026-06-09", status: "รอชำระ" },
  { orderNo: "MRG260608-1036", customer: "ปวีณ์ธิดา ทอง", channel: "หน้าร้าน", items: 2, total: 3880, date: "2026-06-08", status: "ส่งสำเร็จ" },
  { orderNo: "MRG260608-1035", customer: "ณัฐริกา บุญ", channel: "Marketplace", items: 1, total: 2890, date: "2026-06-08", status: "ยกเลิก" },
  { orderNo: "MRG260608-1034", customer: "Emma Wright", channel: "ออนไลน์", items: 5, total: 14750, date: "2026-06-08", status: "ส่งสำเร็จ" },
  { orderNo: "MRG260607-1033", customer: "ชวัลวิทย์ ดี", channel: "ออนไลน์", items: 2, total: 6180, date: "2026-06-07", status: "กำลังจัดส่ง" },
];

// ===== Customers (Customer Insights / CRM) =====
export const customers: RetailRow[] = [
  { name: "ณิชา ภักดี", tier: "VIP", orders: 28, spent: 184200, lastOrder: "2026-06-10", channel: "ออนไลน์" },
  { name: "Emma Wright", tier: "VIP", orders: 19, spent: 142800, lastOrder: "2026-06-08", channel: "ออนไลน์" },
  { name: "พิมพ์มาดา ศรี", tier: "Gold", orders: 12, spent: 78400, lastOrder: "2026-06-10", channel: "หน้าร้าน" },
  { name: "ก้องภพ วัฒน์", tier: "Gold", orders: 9, spent: 61200, lastOrder: "2026-06-09", channel: "ออนไลน์" },
  { name: "Sarah Tan", tier: "Silver", orders: 6, spent: 34900, lastOrder: "2026-06-10", channel: "Marketplace" },
  { name: "ปวีณ์ธิดา ทอง", tier: "Silver", orders: 5, spent: 28100, lastOrder: "2026-06-08", channel: "หน้าร้าน" },
  { name: "Yuki Tanaka", tier: "Silver", orders: 4, spent: 19800, lastOrder: "2026-06-09", channel: "ออนไลน์" },
  { name: "ชวัลวิทย์ ดี", tier: "New", orders: 1, spent: 6180, lastOrder: "2026-06-07", channel: "ออนไลน์" },
  { name: "ณัฐริกา บุญ", tier: "New", orders: 1, spent: 2890, lastOrder: "2026-06-08", channel: "Marketplace" },
];

// ===== Campaigns (Campaign Performance) =====
export const campaigns: RetailRow[] = [
  { name: "Summer 26 Launch", channel: "Instagram", budget: 250000, spent: 218000, revenue: 1240000, roas: "5.7x", status: "กำลังทำงาน" },
  { name: "Denim Days", channel: "TikTok", budget: 180000, spent: 180000, revenue: 742000, roas: "4.1x", status: "จบแล้ว" },
  { name: "VIP Early Access", channel: "Email", budget: 40000, spent: 31000, revenue: 388000, roas: "12.5x", status: "กำลังทำงาน" },
  { name: "Mid-Year Sale", channel: "Facebook", budget: 320000, spent: 96000, revenue: 410000, roas: "4.3x", status: "กำลังทำงาน" },
  { name: "Accessories Edit", channel: "Google", budget: 90000, spent: 90000, revenue: 198000, roas: "2.2x", status: "จบแล้ว" },
  { name: "Lifestyle Pop-up", channel: "Offline", budget: 150000, spent: 0, revenue: 0, roas: "—", status: "ร่าง" },
];

// ===== Stores (Store Performance) — actual MERGE branches as of มิ.ย. 2569 (21 สาขา) =====
// Real location/tel/hours from MERGE official; sales/target/conversion are mock for the ops dashboard.
export const stores: RetailRow[] = [
  // --- STORE (11 สาขา) ---
  { store: "Siam Flagship", type: "STORE", location: "สยามสแควร์ ซอย 2", hours: "10:00–21:00", tel: "090-929-0499", sales: 1840000, target: 1600000, conversion: "24%", status: "เกินเป้า", lat: 13.7448, lng: 100.5331 },
  { store: "Mega Bangna", type: "STORE", location: "เมกาบางนา ชั้น 1", hours: "10:00–22:00", tel: "061-225-5856", sales: 1340000, target: 1300000, conversion: "20%", status: "เกินเป้า", lat: 13.6469, lng: 100.6800 },
  { store: "Central Rama 9", type: "STORE", location: "เซ็นทรัลพระราม 9 ชั้น 3", hours: "10:00–22:00", tel: "095-372-2778", sales: 1180000, target: 1400000, conversion: "19%", status: "ต่ำกว่าเป้า", lat: 13.7576, lng: 100.5654 },
  { store: "Central Eastville", type: "STORE", location: "เซ็นทรัล อีสต์วิลล์ ชั้น 1", hours: "10:00–22:00", tel: "095-372-2877", sales: 980000, target: 1000000, conversion: "18%", status: "ต่ำกว่าเป้า", lat: 13.8055, lng: 100.6159 },
  { store: "Central Westgate", type: "STORE", location: "เซ็นทรัล เวสต์เกต ชั้น 1 Zone D", hours: "10:00–22:00", tel: "099-509-9234", sales: 1060000, target: 1000000, conversion: "20%", status: "เกินเป้า", lat: 13.8757, lng: 100.4111 },
  { store: "Fashion Island", type: "STORE", location: "แฟชั่นไอส์แลนด์ ชั้น 1", hours: "10:00–21:00", tel: "064-589-8294", sales: 920000, target: 1100000, conversion: "18%", status: "ต่ำกว่าเป้า", lat: 13.8252, lng: 100.6781 },
  { store: "The Mall Ngamwongwan", type: "STORE", location: "เดอะมอลล์ งามวงศ์วาน ชั้น 1", hours: "10:00–21:00", tel: "095-885-6684", sales: 760000, target: 800000, conversion: "17%", status: "ต่ำกว่าเป้า", lat: 13.8552, lng: 100.5421 },
  { store: "The Mall Bangkapi", type: "STORE", location: "เดอะมอลล์ บางกะปิ ชั้น G", hours: "10:00–21:00", tel: "080-284-1598", sales: 1060000, target: 1000000, conversion: "20%", status: "เกินเป้า", lat: 13.7654, lng: 100.6432 },
  { store: "Siam Center", type: "STORE", location: "สยามเซ็นเตอร์ ชั้น 1", hours: "10:00–22:00", tel: "097-118-3998", sales: 1520000, target: 1500000, conversion: "21%", status: "เกินเป้า", lat: 13.7464, lng: 100.5321 },
  { store: "Future Park (Zpell)", type: "STORE", location: "ฟิวเจอร์พาร์ค รังสิต (Zpell) ชั้น G", hours: "10:30–21:30", tel: "065-898-8564", sales: 880000, target: 900000, conversion: "18%", status: "ต่ำกว่าเป้า", lat: 13.9866, lng: 100.6177 },
  { store: "Central Ladprao", type: "STORE", location: "เซ็นทรัล ลาดพร้าว ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 1120000, target: 1000000, conversion: "20%", status: "เกินเป้า", lat: 13.8163, lng: 100.5609 },
  // --- CENTRAL DEPART ถาวร (7 สาขา) ---
  { store: "Central Ladprao (Dept)", type: "Central Dept", location: "เซ็นทรัล ลาดพร้าว ชั้น 2 โซน Edition", hours: "10:00–22:00", tel: "—", sales: 640000, target: 700000, conversion: "16%", status: "ต่ำกว่าเป้า", lat: 13.8158, lng: 100.5615 },
  { store: "Central World", type: "Central Dept", location: "เซ็นทรัลเวิลด์ ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 1280000, target: 1200000, conversion: "21%", status: "เกินเป้า", lat: 13.7466, lng: 100.5393 },
  { store: "Central Rama 9 (Dept)", type: "Central Dept", location: "เซ็นทรัลพระราม 9 ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 720000, target: 800000, conversion: "17%", status: "ต่ำกว่าเป้า", lat: 13.7580, lng: 100.5650 },
  { store: "Central Bangna", type: "Central Dept", location: "เซ็นทรัลบางนา ชั้น 1", hours: "10:00–22:00", tel: "—", sales: 690000, target: 750000, conversion: "16%", status: "ต่ำกว่าเป้า", lat: 13.6677, lng: 100.6345 },
  { store: "Central Pinklao", type: "Central Dept", location: "เซ็นทรัลปิ่นเกล้า ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 580000, target: 650000, conversion: "15%", status: "ต่ำกว่าเป้า", lat: 13.7779, lng: 100.4763 },
  { store: "Central Nakhonpathom", type: "Central Dept", location: "เซ็นทรัลนครปฐม ชั้น G", hours: "10:00–22:00", tel: "—", sales: 520000, target: 600000, conversion: "15%", status: "ต่ำกว่าเป้า", lat: 13.8196, lng: 100.0581 },
  { store: "Central Changwattana", type: "Central Dept", location: "เซ็นทรัลแจ้งวัฒนะ ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 610000, target: 650000, conversion: "16%", status: "ต่ำกว่าเป้า", lat: 13.9039, lng: 100.5304 },
  // --- POP UP ไม่ถาวร (3 สาขา) ---
  { store: "King Power Rangnam", type: "Pop-Up", location: "คิง เพาเวอร์ รางน้ำ ชั้น 2", hours: "10:00–21:00", tel: "—", sales: 340000, target: 400000, conversion: "14%", status: "ต่ำกว่าเป้า", lat: 13.7589, lng: 100.5404 },
  { store: "King Power Suvarnabhumi", type: "Pop-Up", location: "สุวรรณภูมิ TW1 ฝั่ง West (ขาออก)", hours: "10:00–22:00", tel: "—", sales: 720000, target: 600000, conversion: "22%", status: "เกินเป้า", lat: 13.6900, lng: 100.7501 },
  { store: "Central Chidlom", type: "Pop-Up", location: "เซ็นทรัลชิดลม ชั้น 2", hours: "10:00–22:00", tel: "—", sales: 480000, target: 500000, conversion: "16%", status: "ต่ำกว่าเป้า", lat: 13.7442, lng: 100.5450 },
];

// ===== Inventory (Inventory Status / Warehouse) — stock per SKU per location =====
export const inventory: RetailRow[] = [
  { sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", location: "Warehouse", onHand: 142, reserved: 28, reorder: 50, status: "ปกติ" },
  { sku: "MRG-DNM-003", name: "Cropped Denim Jacket", location: "Warehouse", onHand: 24, reserved: 12, reorder: 40, status: "ต้องสั่งเพิ่ม" },
  { sku: "MRG-WMN-011", name: "Linen Wrap Blouse", location: "Warehouse", onHand: 0, reserved: 0, reorder: 30, status: "หมดสต๊อก" },
  { sku: "MRG-WMN-013", name: "Oversized Knit Sweater", location: "Warehouse", onHand: 188, reserved: 4, reorder: 30, status: "เกินจำเป็น" },
  { sku: "MRG-ACC-020", name: "Leather Mini Bag", location: "Warehouse", onHand: 32, reserved: 18, reorder: 25, status: "ปกติ" },
  { sku: "MRG-ACC-022", name: "Woven Belt", location: "Siam Square", onHand: 18, reserved: 2, reorder: 20, status: "ต้องสั่งเพิ่ม" },
  { sku: "MRG-LIF-030", name: "Scented Candle — Noir", location: "Warehouse", onHand: 120, reserved: 10, reorder: 40, status: "ปกติ" },
  { sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", location: "Siam Center", onHand: 86, reserved: 6, reorder: 30, status: "ปกติ" },
];

// ===== Per-store operations detail (for 3D branch map) =====
export interface StoreActivity {
  time: string;
  team: string;
  note: string;
  night?: boolean;
}

export interface StoreOps {
  manager: string;
  staff: number;
  areaSqm: number;
  opened: string;
  condition: "เปิดบริการปกติ" | "ปรับปรุงบางส่วน";
  renovation?: string;
  activities: StoreActivity[];
}

export const storeOps: Record<string, StoreOps> = {
  "Siam Flagship": {
    manager: "ธีรภัทร ขายเก่ง", staff: 14, areaSqm: 420, opened: "2024", condition: "ปรับปรุงบางส่วน",
    renovation: "ขยายโซนชั้น 3 เป็น Denim Lab — กำหนดเสร็จ 25 มิ.ย.",
    activities: [
      { time: "คืนนี้ 22:30–02:00", team: "Interior", note: "เข้าวางเฟอร์นิเจอร์ + ติดตั้ง rack โซน Denim Lab ชั้น 3", night: true },
      { time: "วันนี้ 14:00", team: "VM", note: "เปลี่ยนดิสเพลย์หน้าต่างเป็นคอลเลกชั่น Summer 26" },
      { time: "พรุ่งนี้ 09:00", team: "สต๊อก", note: "รับสินค้าเข้า 38 ลัง (เดนิม + Accessories)" },
      { time: "ศ. 13 มิ.ย.", team: "Marketing", note: "ถ่ายคอนเทนต์ TikTok กับน้องมูนิมหน้าร้าน" },
    ],
  },
  "Mega Bangna": {
    manager: "มณี ส่องแสง", staff: 9, areaSqm: 180, opened: "2024", condition: "เปิดบริการปกติ",
    activities: [
      { time: "คืนนี้ 22:00", team: "Interior", note: "ซ่อมไฟส่องสินค้าโซนกางเกงยีนส์", night: true },
      { time: "วันนี้ 11:00", team: "VM", note: "จัด mannequin ชุดใหม่ 6 ตัว" },
      { time: "พฤ. 12 มิ.ย.", team: "สต๊อก", note: "เติมสต๊อก A Day Bag Nylon รอบสัปดาห์" },
    ],
  },
  "Central Rama 9": {
    manager: "กานต์ ดีใจ", staff: 8, areaSqm: 165, opened: "2024", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 13:00", team: "ขาย", note: "อบรมพนักงานเรื่องโปรโมชัน Mid-Year Sale" },
      { time: "พรุ่งนี้ 10:30", team: "สต๊อก", note: "ตรวจนับสต๊อกประจำเดือน" },
    ],
  },
  "Central Eastville": {
    manager: "พิมพ์ใจ สวยงาม", staff: 7, areaSqm: 140, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 15:00", team: "VM", note: "ปรับ layout โต๊ะกลางรับคอลเลกชั่นใหม่" },
      { time: "ส. 14 มิ.ย.", team: "Marketing", note: "กิจกรรม Member Day ส่วนลดพิเศษ" },
    ],
  },
  "Central Westgate": {
    manager: "ภูวนาท มั่นคง", staff: 8, areaSqm: 150, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "คืนนี้ 21:30", team: "Interior", note: "เปลี่ยนพรมโซนลองชุด", night: true },
      { time: "พรุ่งนี้ 09:30", team: "สต๊อก", note: "รับสินค้าเข้า 22 ลัง" },
    ],
  },
  "Fashion Island": {
    manager: "ชลิตา งามพร้อม", staff: 7, areaSqm: 135, opened: "2025", condition: "ปรับปรุงบางส่วน",
    renovation: "เปลี่ยนเคาน์เตอร์แคชเชียร์ใหม่ — เสร็จ 15 มิ.ย.",
    activities: [
      { time: "คืนนี้ 22:00–01:00", team: "Interior", note: "ติดตั้งเคาน์เตอร์แคชเชียร์ + เดินสายไฟใหม่", night: true },
      { time: "วันนี้ 12:00", team: "ขาย", note: "ย้ายจุดชำระเงินชั่วคราวไปโซนหลังร้าน" },
    ],
  },
  "The Mall Ngamwongwan": {
    manager: "ณัฐพล มีสุข", staff: 6, areaSqm: 120, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 14:30", team: "VM", note: "จัดดิสเพลย์โปรโมชันหน้าร้าน" },
      { time: "อา. 15 มิ.ย.", team: "สต๊อก", note: "คืนสินค้า slow-moving กลับคลังกลาง" },
    ],
  },
  "The Mall Bangkapi": {
    manager: "ธนกร ช่างคิด", staff: 7, areaSqm: 130, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "คืนนี้ 21:45", team: "Interior", note: "เก็บงานป้าย logo ใหม่หน้าร้าน", night: true },
      { time: "พรุ่งนี้ 11:00", team: "Marketing", note: "ติดตั้งสื่อโปรโมชัน Mid-Year Sale" },
    ],
  },
  "Siam Center": {
    manager: "อรทัย พิมพ์ใจ", staff: 10, areaSqm: 200, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 16:00", team: "VM", note: "เซ็ตดิสเพลย์ Exclusive A Day Bag Nylon in Micro" },
      { time: "พรุ่งนี้ 10:00", team: "สต๊อก", note: "เติมสต๊อกรอบเปิดร้าน 18 ลัง" },
      { time: "ศ. 13 มิ.ย.", team: "Marketing", note: "Influencer visit ถ่ายรีวิวหน้าร้าน" },
    ],
  },
  "Future Park (Zpell)": {
    manager: "ศิริ สร้างสรรค์", staff: 8, areaSqm: 160, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 13:30", team: "ขาย", note: "ประชุมทีมยอดขายรายสัปดาห์" },
      { time: "ส. 14 มิ.ย.", team: "VM", note: "เปลี่ยน window display ธีม Summer" },
    ],
  },
  "Central Ladprao": {
    manager: "วิชัย จัดหา", staff: 8, areaSqm: 155, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [
      { time: "คืนนี้ 22:15", team: "Interior", note: "วางเฟอร์นิเจอร์โซนรอเข้าห้องลอง", night: true },
      { time: "พรุ่งนี้ 09:00", team: "สต๊อก", note: "รับสินค้าเข้ารอบแรกหลังเปิดสาขา" },
    ],
  },
  "Central Ladprao (Dept)": {
    manager: "พัชรี สุขสวัสดิ์", staff: 3, areaSqm: 48, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [{ time: "วันนี้ 12:00", team: "VM", note: "จัดเรียงสินค้าลาน Edition ใหม่" }],
  },
  "Central World": {
    manager: "ปวีณ์ธิดา ทอง", staff: 5, areaSqm: 60, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [
      { time: "วันนี้ 15:30", team: "VM", note: "เปลี่ยน rack กลางเป็นคอลเลกชั่น Summer 26" },
      { time: "พฤ. 12 มิ.ย.", team: "สต๊อก", note: "เติมไซส์ขาดยีนส์รุ่นขายดี" },
    ],
  },
  "Central Rama 9 (Dept)": {
    manager: "กานต์ ดีใจ", staff: 3, areaSqm: 45, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [{ time: "พรุ่งนี้ 11:30", team: "สต๊อก", note: "สลับสต๊อกกับ Merge Rama9 Store ชั้น 3" }],
  },
  "Central Bangna": {
    manager: "ดารา เด่นชัย", staff: 3, areaSqm: 42, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [{ time: "วันนี้ 14:00", team: "VM", note: "จัด mannequin คู่ AIMER โซนทางเดิน" }],
  },
  "Central Pinklao": {
    manager: "นภา ฟ้าใส", staff: 3, areaSqm: 40, opened: "2025", condition: "เปิดบริการปกติ",
    activities: [{ time: "ส. 14 มิ.ย.", team: "สต๊อก", note: "ตรวจนับสต๊อกรอบครึ่งเดือน" }],
  },
  "Central Nakhonpathom": {
    manager: "ก้อง รุ่งโรจน์", staff: 2, areaSqm: 38, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [{ time: "วันนี้ 13:00", team: "ขาย", note: "เทรนพนักงานใหม่ 1 คน" }],
  },
  "Central Changwattana": {
    manager: "ธิดา ใจงาม", staff: 3, areaSqm: 44, opened: "2026", condition: "ปรับปรุงบางส่วน",
    renovation: "ย้ายจุดตั้งร้านเข้าใกล้ทางเข้าโซน — เสร็จ 20 มิ.ย.",
    activities: [
      { time: "คืนนี้ 21:30–00:30", team: "Interior", note: "รื้อ + ย้าย fixture ไปจุดใหม่หน้าทางเข้า", night: true },
    ],
  },
  "King Power Rangnam": {
    manager: "พลอย สดใส", staff: 2, areaSqm: 35, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [{ time: "วันนี้ 12:30", team: "VM", note: "จัดสินค้า Lifestyle สำหรับนักท่องเที่ยว" }],
  },
  "King Power Suvarnabhumi": {
    manager: "ชวัลวิทย์ ดี", staff: 4, areaSqm: 55, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [
      { time: "คืนนี้ 23:00", team: "สต๊อก", note: "เติมสต๊อกรอบดึก (ร้านในสนามบินคนแน่นช่วงเช้า)", night: true },
      { time: "พรุ่งนี้ 08:00", team: "ขาย", note: "เปิดกะเช้ารับไฟลท์ขาออกยุโรป" },
    ],
  },
  "Central Chidlom": {
    manager: "ณัฐริกา บุญ", staff: 2, areaSqm: 32, opened: "2026", condition: "เปิดบริการปกติ",
    activities: [{ time: "ศ. 13 มิ.ย.", team: "Marketing", note: "ประเมินยอด Pop-Up ก่อนตัดสินใจต่อสัญญา" }],
  },
};

// ===== Staff roster per store (front-of-house team) =====
export const storeTeam: Record<string, { name: string; role: string }[]> = {
  "Siam Flagship": [
    { name: "ธีรภัทร ขายเก่ง", role: "Store Manager" },
    { name: "วราภรณ์ แสนดี", role: "Assistant Manager" },
    { name: "จิรายุ พร้อมเพรียง", role: "Senior Sales" },
    { name: "สุชานาถ ใจเย็น", role: "Sales Associate" },
    { name: "ปาริชาต ยิ้มแย้ม", role: "Sales Associate" },
    { name: "อนันต์ รวดเร็ว", role: "Cashier" },
  ],
  "Mega Bangna": [
    { name: "มณี ส่องแสง", role: "Store Manager" },
    { name: "กิตติพงศ์ มุ่งมั่น", role: "Senior Sales" },
    { name: "ชุติมา อ่อนหวาน", role: "Sales Associate" },
    { name: "เบญจวรรณ คล่องแคล่ว", role: "Cashier" },
  ],
  "Central Rama 9": [
    { name: "กานต์ ดีใจ", role: "Store Manager" },
    { name: "ปรียา ตั้งใจ", role: "Senior Sales" },
    { name: "วุฒิชัย บริการดี", role: "Sales Associate" },
  ],
  "Central Eastville": [
    { name: "พิมพ์ใจ สวยงาม", role: "Store Manager" },
    { name: "ณิชกานต์ เรียบร้อย", role: "Sales Associate" },
    { name: "ภาคิน ขยันยิ่ง", role: "Sales Associate" },
  ],
  "Central Westgate": [
    { name: "ภูวนาท มั่นคง", role: "Store Manager" },
    { name: "รุ่งนภา สู้งาน", role: "Senior Sales" },
    { name: "เจษฎา ว่องไว", role: "Cashier" },
  ],
  "Fashion Island": [
    { name: "ชลิตา งามพร้อม", role: "Store Manager" },
    { name: "ไอรดา น่ารัก", role: "Sales Associate" },
    { name: "ธนวัฒน์ ใจถึง", role: "Sales Associate" },
  ],
  "The Mall Ngamwongwan": [
    { name: "ณัฐพล มีสุข", role: "Store Manager" },
    { name: "ศศิธร แจ่มใส", role: "Sales Associate" },
  ],
  "The Mall Bangkapi": [
    { name: "ธนกร ช่างคิด", role: "Store Manager" },
    { name: "อภิญญา ช่างพูด", role: "Senior Sales" },
    { name: "ปกรณ์ อดทน", role: "Cashier" },
  ],
  "Siam Center": [
    { name: "อรทัย พิมพ์ใจ", role: "Store Manager" },
    { name: "คณิศร ทันสมัย", role: "Senior Sales" },
    { name: "พิชามญชุ์ มีสไตล์", role: "Sales Associate" },
    { name: "ภัสสร ตาไว", role: "Sales Associate" },
  ],
  "Future Park (Zpell)": [
    { name: "ศิริ สร้างสรรค์", role: "Store Manager" },
    { name: "ดนุพล ตรงเวลา", role: "Sales Associate" },
    { name: "วนิดา รอบคอบ", role: "Cashier" },
  ],
  "Central Ladprao": [
    { name: "วิชัย จัดหา", role: "Store Manager" },
    { name: "กมลชนก สดชื่น", role: "Senior Sales" },
    { name: "ศุภกร แข็งขัน", role: "Sales Associate" },
  ],
  "Central Ladprao (Dept)": [
    { name: "พัชรี สุขสวัสดิ์", role: "Counter Lead" },
    { name: "นรินทร์ นิ่มนวล", role: "Sales Associate" },
  ],
  "Central World": [
    { name: "ปวีณ์ธิดา ทอง", role: "Counter Lead" },
    { name: "กฤตภาส มีชั้นเชิง", role: "Sales Associate" },
    { name: "ลลิตา อบอุ่น", role: "Sales Associate" },
  ],
  "Central Rama 9 (Dept)": [
    { name: "อมรรัตน์ ผ่องใส", role: "Counter Lead" },
    { name: "ธีรเดช สุภาพ", role: "Sales Associate" },
  ],
  "Central Bangna": [
    { name: "ดารา เด่นชัย", role: "Counter Lead" },
    { name: "ปริญญา ตื่นตัว", role: "Sales Associate" },
  ],
  "Central Pinklao": [
    { name: "นภา ฟ้าใส", role: "Counter Lead" },
    { name: "วีรภัทร มีน้ำใจ", role: "Sales Associate" },
  ],
  "Central Nakhonpathom": [
    { name: "ก้อง รุ่งโรจน์", role: "Counter Lead" },
    { name: "จุฑามาศ เพียรดี", role: "Sales Associate" },
  ],
  "Central Changwattana": [
    { name: "ธิดา ใจงาม", role: "Counter Lead" },
    { name: "อิทธิพล กระตือรือร้น", role: "Sales Associate" },
  ],
  "King Power Rangnam": [
    { name: "พลอย สดใส", role: "Pop-Up Lead" },
    { name: "ชนกันต์ พูดเก่ง", role: "Sales Associate" },
  ],
  "King Power Suvarnabhumi": [
    { name: "ชวัลวิทย์ ดี", role: "Pop-Up Lead" },
    { name: "มาริสา สองภาษา", role: "Sales Associate" },
    { name: "เตชินท์ ตื่นเช้า", role: "Sales Associate" },
  ],
  "Central Chidlom": [
    { name: "ณัฐริกา บุญ", role: "Pop-Up Lead" },
    { name: "พิมพ์ชนก ละเอียด", role: "Sales Associate" },
  ],
};

// ===== Warehouse layout (3D view) — tall racks in storage zones A/B, 6 levels each =====
export interface RackSlot {
  sku: string;
  name: string;
  category: string;
  qty: number;
}

export interface WarehouseRack {
  id: string;
  zone: "A" | "B";
  row: number;
  col: number;
  levels: RackSlot[][];
}

export const warehouseRacks: WarehouseRack[] = [
  {
    id: "A-01", zone: "A", row: 0, col: 0,
    levels: [
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 64 }],
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 50 }],
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 38 }],
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 130 }],
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 110 }],
      [{ sku: "MRG-DNM-003", name: "Cropped Denim Jacket", category: "เดนิม", qty: 80 }],
    ],
  },
  {
    id: "A-02", zone: "A", row: 0, col: 1,
    levels: [
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 48 }],
      [{ sku: "MRG-DNM-003", name: "Cropped Denim Jacket", category: "เดนิม", qty: 24 }],
      [],
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 90 }],
      [{ sku: "MRG-DNM-003", name: "Cropped Denim Jacket", category: "เดนิม", qty: 60 }],
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 100 }],
    ],
  },
  {
    id: "A-03", zone: "A", row: 0, col: 2,
    levels: [
      [{ sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", qty: 36 }],
      [{ sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", qty: 22 }],
      [{ sku: "MRG-WMN-012", name: "Tailored Wide Trousers", category: "สตรี", qty: 40 }],
      [{ sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", qty: 80 }],
      [{ sku: "MRG-WMN-012", name: "Tailored Wide Trousers", category: "สตรี", qty: 75 }],
      [{ sku: "MRG-WMN-013", name: "Oversized Knit Sweater", category: "สตรี", qty: 88 }],
    ],
  },
  {
    id: "A-04", zone: "A", row: 1, col: 0,
    levels: [
      [{ sku: "MRG-WMN-012", name: "Tailored Wide Trousers", category: "สตรี", qty: 54 }],
      [{ sku: "MRG-WMN-013", name: "Oversized Knit Sweater", category: "สตรี", qty: 96 }],
      [{ sku: "MRG-WMN-013", name: "Oversized Knit Sweater", category: "สตรี", qty: 92 }],
      [{ sku: "MRG-WMN-012", name: "Tailored Wide Trousers", category: "สตรี", qty: 120 }],
      [{ sku: "MRG-WMN-013", name: "Oversized Knit Sweater", category: "สตรี", qty: 140 }],
      [{ sku: "MRG-WMN-011", name: "Linen Wrap Blouse", category: "สตรี", qty: 60 }],
    ],
  },
  {
    id: "A-05", zone: "A", row: 1, col: 1,
    levels: [
      [],
      [{ sku: "MRG-WMN-011", name: "Linen Wrap Blouse", category: "สตรี", qty: 0 }],
      [],
      [{ sku: "MRG-WMN-011", name: "Linen Wrap Blouse", category: "สตรี", qty: 45 }],
      [],
      [{ sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", qty: 30 }],
    ],
  },
  {
    id: "A-06", zone: "A", row: 1, col: 2,
    levels: [
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 28 }],
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 18 }],
      [{ sku: "MRG-DNM-003", name: "Cropped Denim Jacket", category: "เดนิม", qty: 12 }],
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 16 }],
      [],
      [{ sku: "MRG-DNM-002", name: "Wide-Leg Raw Denim", category: "เดนิม", qty: 8 }],
    ],
  },
  {
    id: "B-01", zone: "B", row: 0, col: 0,
    levels: [
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 32 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 120 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 90 }],
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 70 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 200 }],
      [{ sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", qty: 64 }],
    ],
  },
  {
    id: "B-02", zone: "B", row: 0, col: 1,
    levels: [
      [{ sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", qty: 18 }],
      [],
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 14 }],
      [{ sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", qty: 80 }],
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 50 }],
      [],
    ],
  },
  {
    id: "B-03", zone: "B", row: 0, col: 2,
    levels: [
      [{ sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", qty: 60 }],
      [{ sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", qty: 60 }],
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 44 }],
      [{ sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", qty: 120 }],
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 96 }],
      [{ sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", qty: 75 }],
    ],
  },
  {
    id: "B-04", zone: "B", row: 1, col: 0,
    levels: [
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 32 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 54 }],
      [],
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 88 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 110 }],
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 40 }],
    ],
  },
  {
    id: "B-05", zone: "B", row: 1, col: 1,
    levels: [
      [{ sku: "MRG-WMN-010", name: "Silk Slip Dress", category: "สตรี", qty: 20 }],
      [{ sku: "MRG-DNM-001", name: "High-Rise Slim Jeans", category: "เดนิม", qty: 30 }],
      [{ sku: "MRG-LIF-030", name: "Scented Candle — Noir", category: "Lifestyle", qty: 24 }],
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 60 }],
      [{ sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", qty: 44 }],
      [{ sku: "MRG-ACC-021", name: "Gold Hoop Earrings", category: "Accessories", qty: 70 }],
    ],
  },
  {
    id: "B-06", zone: "B", row: 1, col: 2,
    levels: [
      [],
      [],
      [{ sku: "MRG-ACC-022", name: "Woven Belt", category: "Accessories", qty: 8 }],
      [{ sku: "MRG-ACC-020", name: "Leather Mini Bag", category: "Accessories", qty: 12 }],
      [],
      [{ sku: "MRG-LIF-031", name: "Canvas Tote", category: "Lifestyle", qty: 16 }],
    ],
  },
];

// ===== Sales trend (last 7 days) for dashboard chart =====
export const salesTrend = [
  { day: "พฤ", label: "4 มิ.ย.", sales: 386000, orders: 142 },
  { day: "ศ", label: "5 มิ.ย.", sales: 512000, orders: 198 },
  { day: "ส", label: "6 มิ.ย.", sales: 684000, orders: 256 },
  { day: "อา", label: "7 มิ.ย.", sales: 642000, orders: 241 },
  { day: "จ", label: "8 มิ.ย.", sales: 398000, orders: 151 },
  { day: "อ", label: "9 มิ.ย.", sales: 458000, orders: 174 },
  { day: "พ", label: "10 มิ.ย.", sales: 534000, orders: 203 },
];

// ===== Channel split for dashboard =====
export const channelSplit = [
  { channel: "หน้าร้าน", value: 48, sales: 1680000 },
  { channel: "ออนไลน์", value: 31, sales: 1085000 },
  { channel: "Marketplace", value: 14, sales: 490000 },
  { channel: "Wholesale", value: 7, sales: 245000 },
];
