// ใบจัดของจากโกดัง → สาขา (client-only, localStorage)
// โกดัง 3D เขียนตอน "ยืนยันจัดของ" · แผนที่สาขาอ่านมาโชว์ "ลังกำลังส่งมา"

export interface ShipmentItem {
  sku: string;
  name: string;
  qty: number;
}

export interface Shipment {
  code: string;
  store: string;
  items: ShipmentItem[];
  total: number;
  ts: number;
}

const KEY = "merge-shipments-v1";

function readAll(): Shipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Shipment[]) : [];
  } catch {
    return [];
  }
}

export function addShipment(s: Shipment): void {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all.unshift(s);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
  } catch {
    // storage unavailable — non-fatal
  }
}

export function getShipmentsFor(store: string): Shipment[] {
  return readAll().filter((s) => s.store === store);
}
