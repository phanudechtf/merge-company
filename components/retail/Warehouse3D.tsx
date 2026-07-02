"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Search, X, Box, Layers3, PackageOpen, AlertTriangle, Compass, Plus, ClipboardList, Truck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { warehouseRacks, stores, type WarehouseRack } from "@/lib/mock-retail";
import { addShipment } from "@/lib/store-shipments";
import { useToast } from "@/components/ui/toast";

interface PickItem {
  key: string;
  rackId: string;
  sku: string;
  name: string;
  category: string;
  available: number;
  qty: number;
}

const storeNames = stores.filter((s) => s.type === "STORE").map((s) => String(s.store));

const categoryColor: Record<string, string> = {
  "เดนิม": "#3b5b7d",
  "สตรี": "#c98da4",
  "Accessories": "#a9aeb5",
  "Lifestyle": "#7d8c6e",
};

const RACK_CAPACITY_PER_LEVEL = 100;

// world layout — tall racks (ปีนบันไดถึงชั้นบน)
const RACK_W = 3.6, RACK_D = 1.4, LEVEL_H = 1.2, LEVELS = 6;
const CRATE_H = LEVEL_H * 0.74;
const ZONE_GAP = 7;

type RackStatus = "empty" | "low" | "full" | "normal";

function rackMetrics(r: WarehouseRack) {
  const slots = r.levels.flat();
  const qty = slots.reduce((s, x) => s + x.qty, 0);
  const filled = slots.filter((s) => s.qty > 0);
  const low = slots.filter((s) => s.qty > 0 && s.qty < 20).length;
  const used = r.levels.filter((l) => l.some((x) => x.qty > 0)).length;
  const status: RackStatus = filled.length === 0 ? "empty" : low > 0 ? "low" : used >= LEVELS ? "full" : "normal";
  return { qty, filled, low, used, status };
}

const rackStatusTone = {
  empty: { label: "ว่าง", className: "bg-slate-100 text-slate-400", color: "#cbd5e1" },
  low: { label: "ใกล้หมด", className: "bg-amber-100 text-amber-700", color: "#f59e0b" },
  full: { label: "เต็ม", className: "bg-emerald-100 text-emerald-700", color: "#10b981" },
  normal: { label: "ปกติ", className: "bg-blue-100 text-blue-700", color: "#3b82f6" },
} as const;

function rackPosition(r: WarehouseRack): [number, number] {
  const baseX = r.zone === "A" ? -ZONE_GAP : ZONE_GAP;
  const x = baseX + (r.col - 1) * (RACK_W + 1.2);
  const z = -2 + r.row * (RACK_D + 3.2);
  return [x, z];
}

function makeTextSprite(text: string, color = "#6b6257", size = 90) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.font = `bold ${size}px Inter, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(6, 1.5, 1);
  return sprite;
}

export function Warehouse3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ focusRack: (id: string | null) => void } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [rackTab, setRackTab] = useState<"stock" | "pick" | "movement" | "alerts">("stock");
  const [query, setQuery] = useState("");
  const selectedSetterRef = useRef(setSelected);
  selectedSetterRef.current = setSelected;

  const toast = useToast();
  const [pickList, setPickList] = useState<PickItem[]>([]);
  const [destStore, setDestStore] = useState(storeNames[0] ?? "");

  const addPick = (rackId: string, slot: { sku: string; name: string; category: string; qty: number }) => {
    const key = `${rackId}|${slot.sku}`;
    setPickList((prev) => {
      if (prev.some((p) => p.key === key)) return prev;
      return [...prev, { key, rackId, sku: slot.sku, name: slot.name, category: slot.category, available: slot.qty, qty: Math.min(slot.qty, 10) }];
    });
  };
  const setPickQty = (key: string, v: number) =>
    setPickList((prev) => prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, Math.min(p.available, v || 1)) } : p)));
  const removePick = (key: string) => setPickList((prev) => prev.filter((p) => p.key !== key));
  const confirmPick = () => {
    if (!pickList.length || !destStore) return;
    const total = pickList.reduce((s, p) => s + p.qty, 0);
    const code = `PICK-${Date.now().toString().slice(-5)}`;
    addShipment({
      code,
      store: destStore,
      items: pickList.map((p) => ({ sku: p.sku, name: p.name, qty: p.qty })),
      total,
      ts: Date.now(),
    });
    toast(`${code} → ${destStore}: ${pickList.length} รายการ ${total} ชิ้น — ส่งให้โกดังหยิบลงลังแล้ว`);
    setPickList([]);
  };
  const inPick = (rackId: string, sku: string) => pickList.some((p) => p.key === `${rackId}|${sku}`);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f2eee6");
    scene.fog = new THREE.Fog("#f2eee6", 55, 95);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.set(0, 22, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 5;
    controls.maxDistance = 76;
    controls.target.set(0, 2.6, 0);

    // lights
    scene.add(new THREE.HemisphereLight("#ffffff", "#d8d0c0", 0.9));
    const sun = new THREE.DirectionalLight("#fff8ec", 1.4);
    sun.position.set(18, 28, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -35; sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
    scene.add(sun);

    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 40),
      new THREE.MeshStandardMaterial({ color: "#dcd5c8", roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    scene.add(new THREE.GridHelper(64, 32, 0xc9c1b2, 0xcfc8ba));

    // walls (back + sides, low)
    const wallMat = new THREE.MeshStandardMaterial({ color: "#e8e2d6", roughness: 0.9 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(64, 8, 0.4), wallMat);
    backWall.position.set(0, 4, -20);
    scene.add(backWall);
    for (const sx of [-32, 32]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 40), wallMat);
      side.position.set(sx, 4, 0);
      scene.add(side);
    }

    // zone floor patches + labels
    const zones: { label: string; color: string; x: number; z: number; w: number; d: number }[] = [
      { label: "RECEIVING", color: "#cdd8e0", x: -24, z: 12, w: 12, d: 10 },
      { label: "ZONE A — DENIM / WOMEN", color: "#d9d2c4", x: -ZONE_GAP, z: 0, w: 16, d: 12 },
      { label: "ZONE B — ACC / LIFESTYLE", color: "#d9d2c4", x: ZONE_GAP, z: 0, w: 16, d: 12 },
      { label: "PACKING", color: "#dcd8c8", x: 0, z: 14, w: 14, d: 8 },
      { label: "SHIPPING", color: "#cfd9cf", x: 24, z: 12, w: 12, d: 10 },
    ];
    for (const z of zones) {
      const patch = new THREE.Mesh(
        new THREE.PlaneGeometry(z.w, z.d),
        new THREE.MeshStandardMaterial({ color: z.color, roughness: 1 })
      );
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(z.x, 0.01, z.z);
      patch.receiveShadow = true;
      scene.add(patch);
      const label = makeTextSprite(z.label);
      label.position.set(z.x, 4.6, z.z);
      scene.add(label);
    }

    // shared geometries/materials
    const poleGeo = new THREE.BoxGeometry(0.12, LEVEL_H * LEVELS + 0.3, 0.12);
    const poleMat = new THREE.MeshStandardMaterial({ color: "#8a8276", roughness: 0.6, metalness: 0.4 });
    const shelfGeo = new THREE.BoxGeometry(RACK_W, 0.08, RACK_D);
    const shelfMat = new THREE.MeshStandardMaterial({ color: "#a39a8a", roughness: 0.7, metalness: 0.3 });
    // ลังทึบใบใหญ่ — 1 ใบต่อ slot, สีตามหมวด (ไม่เห็นของข้างใน)
    const crateGeo = new THREE.BoxGeometry(1, 1, 1);
    const crateMats: Record<string, THREE.MeshStandardMaterial> = {};
    for (const [cat, col] of Object.entries(categoryColor)) {
      crateMats[cat] = new THREE.MeshStandardMaterial({ color: col, roughness: 0.88, metalness: 0.04 });
    }
    const crateFallback = new THREE.MeshStandardMaterial({ color: "#9a9183", roughness: 0.88 });

    const rackGroups = new Map<string, THREE.Group>();

    for (const rack of warehouseRacks) {
      const [x, z] = rackPosition(rack);
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.userData.rackId = rack.id;

      for (const px of [-RACK_W / 2 + 0.1, RACK_W / 2 - 0.1]) {
        for (const pz of [-RACK_D / 2 + 0.1, RACK_D / 2 - 0.1]) {
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.set(px, (LEVEL_H * LEVELS + 0.3) / 2, pz);
          pole.castShadow = true;
          g.add(pole);
        }
      }

      rack.levels.forEach((slots, li) => {
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, li * LEVEL_H + 0.06, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        g.add(shelf);

        // ลังใหญ่ 1 ใบต่อ slot ที่มีของ — เรียงบนชั้น
        const filled = slots.filter((s) => s.qty > 0);
        const n = filled.length;
        filled.forEach((slot, si) => {
          const crate = new THREE.Mesh(crateGeo, crateMats[slot.category] ?? crateFallback);
          const slotW = (RACK_W - 0.4) / n;
          const cw = Math.min(slotW - 0.16, 1.6);
          const cx = -RACK_W / 2 + 0.2 + slotW * (si + 0.5);
          crate.scale.set(cw, CRATE_H, RACK_D * 0.74);
          crate.position.set(cx, li * LEVEL_H + 0.1 + CRATE_H / 2, 0);
          crate.castShadow = true;
          crate.receiveShadow = true;
          g.add(crate);
        });
      });

      // rack id label
      const idLabel = makeTextSprite(rack.id, "#111111", 110);
      idLabel.scale.set(2.4, 0.6, 1);
      idLabel.position.set(0, LEVEL_H * LEVELS + 0.9, 0);
      g.add(idLabel);

      scene.add(g);
      rackGroups.set(rack.id, g);
    }

    // receiving / packing / shipping props — pallets with stacked boxes
    const palletMat = new THREE.MeshStandardMaterial({ color: "#b09a72", roughness: 0.9 });
    const propBoxMat = new THREE.MeshStandardMaterial({ color: "#c2b49a", roughness: 0.85 });
    const propAt = (x: number, z: number, stack: number) => {
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.6), palletMat);
      pallet.position.set(x, 0.07, z);
      pallet.castShadow = true;
      scene.add(pallet);
      for (let i = 0; i < stack; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), propBoxMat);
        b.position.set(x, 0.45 + i * 0.62, z);
        b.castShadow = true;
        scene.add(b);
      }
    };
    propAt(-26, 11, 3); propAt(-23.5, 13.5, 2); propAt(-21.5, 10.5, 1);
    propAt(22.5, 11, 2); propAt(25.5, 13, 1);
    // packing tables
    const tableMat = new THREE.MeshStandardMaterial({ color: "#9b9183", roughness: 0.7 });
    for (const tx of [-3, 3]) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 1.6), tableMat);
      table.position.set(tx, 0.95, 14);
      table.castShadow = true;
      scene.add(table);
      for (const lx of [-1.7, 1.7]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 1.4), tableMat);
        leg.position.set(tx + lx, 0.45, 14);
        scene.add(leg);
      }
    }

    // rolling ladders — คลังสูง ต้องปีนถึงชั้นบน
    const ladderMat = new THREE.MeshStandardMaterial({ color: "#8a8276", roughness: 0.6, metalness: 0.35 });
    const makeLadder = (x: number, z: number, rotY: number) => {
      const lad = new THREE.Group();
      const h = LEVELS * LEVEL_H * 0.92;
      for (const sx of [-0.42, 0.42]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.08), ladderMat);
        rail.position.set(sx, h / 2, 0);
        rail.castShadow = true;
        lad.add(rail);
      }
      const rungN = 9;
      for (let i = 1; i <= rungN; i++) {
        const rung = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.05), ladderMat);
        rung.position.set(0, (h / (rungN + 1)) * i, 0);
        lad.add(rung);
      }
      const plat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.6), ladderMat);
      plat.position.set(0, h, 0.32);
      plat.castShadow = true;
      lad.add(plat);
      for (const wx of [-0.42, 0.42]) for (const wz of [-0.28, 0.28]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), ladderMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.1, wz);
        lad.add(wheel);
      }
      lad.position.set(x, 0, z);
      lad.rotation.y = rotY;
      scene.add(lad);
    };
    makeLadder(5, -2, 0);
    makeLadder(5, 2.6, 0);
    makeLadder(-10.5, -2, 0);
    makeLadder(-10.5, 2.6, 0);

    // selection highlight ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 2.7, 48),
      new THREE.MeshBasicMaterial({ color: "#d7d7d7", side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    ring.visible = false;
    scene.add(ring);
    const hoverRing = new THREE.Mesh(
      new THREE.RingGeometry(2.05, 2.22, 48),
      new THREE.MeshBasicMaterial({ color: "#111111", side: THREE.DoubleSide, transparent: true, opacity: 0.22 })
    );
    hoverRing.rotation.x = -Math.PI / 2;
    hoverRing.position.y = 0.04;
    hoverRing.visible = false;
    scene.add(hoverRing);

    // camera tween targets
    const desired = { target: new THREE.Vector3(0, 1, 0), pos: camera.position.clone(), active: false };

    const focusRack = (id: string | null) => {
      if (!id) { ring.visible = false; return; }
      const g = rackGroups.get(id);
      if (!g) return;
      ring.visible = true;
      ring.position.set(g.position.x, 0.03, g.position.z);
      desired.target.set(g.position.x, 3.4, g.position.z);
      desired.pos.set(g.position.x + 6.5, 9, g.position.z + 10);
      desired.active = true;
    };
    apiRef.current = {
      focusRack,
    };

    // picking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt = 0;
    const rackAtPointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...rackGroups.values()], true);
      if (!hits[0]) return null;
      let o: THREE.Object3D | null = hits[0].object;
      while (o && !o.userData.rackId) o = o.parent;
      const rackId = (o?.userData.rackId as string) ?? null;
      const group = rackId ? rackGroups.get(rackId) ?? null : null;
      return { rackId, group };
    };
    const onPointerDown = () => { downAt = Date.now(); };
    const onPointerMove = (ev: PointerEvent) => {
      const hit = rackAtPointer(ev);
      if (!hit?.rackId || !hit.group) {
        hoverRing.visible = false;
        renderer.domElement.style.cursor = "";
        return;
      }
      hoverRing.visible = true;
      hoverRing.position.set(hit.group.position.x, 0.04, hit.group.position.z);
      renderer.domElement.style.cursor = "pointer";
    };
    const onPointerUp = (ev: PointerEvent) => {
      if (Date.now() - downAt > 250) return; // drag, not click
      const rackId = rackAtPointer(ev)?.rackId ?? null;
      selectedSetterRef.current(rackId);
      focusRack(rackId);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // resize
    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (desired.active) {
        controls.target.lerp(desired.target, 0.06);
        camera.position.lerp(desired.pos, 0.06);
        if (camera.position.distanceTo(desired.pos) < 0.08) desired.active = false;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      apiRef.current = null;
    };
  }, []);

  const resetView = () => {
    setSelected(null);
    setRackTab("stock");
    apiRef.current?.focusRack(null);
  };

  const pickRack = (id: string) => {
    setSelected(id);
    setRackTab("stock");
    apiRef.current?.focusRack(id);
  };

  // derived stats
  const allSlots = warehouseRacks.flatMap((r) => r.levels.flat());
  const totalQty = allSlots.reduce((s, x) => s + x.qty, 0);
  const skuCount = new Set(allSlots.filter((s) => s.qty > 0).map((s) => s.sku)).size;
  const totalLevels = warehouseRacks.length * LEVELS;
  const usedLevels = warehouseRacks.reduce((s, r) => s + r.levels.filter((l) => l.some((x) => x.qty > 0)).length, 0);
  const lowSlots = allSlots.filter((s) => s.qty > 0 && s.qty < 20).length;

  const q = query.trim().toLowerCase();
  const filteredRacks = !q
    ? warehouseRacks
    : warehouseRacks.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.levels.flat().some((s) => s.sku.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      );

  const sel = selected ? warehouseRacks.find((r) => r.id === selected) : null;
  const selMetrics = sel ? rackMetrics(sel) : null;
  const selQty = selMetrics?.qty ?? 0;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] overflow-hidden">
      {/* Rack list panel */}
      <div className="w-full md:w-[290px] md:min-w-[290px] border-b md:border-b-0 md:border-r border-line bg-white flex flex-col h-[36vh] md:h-auto">
        <div className="p-4 border-b border-line space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">คลังสินค้า · หาดใหญ่</p>
            <button onClick={resetView} className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1 font-medium">
              <Compass size={12} /> มุมเริ่มต้น
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "SKU ในคลัง", value: skuCount, icon: <Box size={12} /> },
              { label: "ชิ้นรวม", value: totalQty.toLocaleString(), icon: <PackageOpen size={12} /> },
              { label: "ชั้นที่ใช้", value: `${usedLevels}/${totalLevels}`, icon: <Layers3 size={12} /> },
              { label: "ช่องใกล้หมด", value: lowSlots, icon: <AlertTriangle size={12} /> },
            ].map((k) => (
              <div key={k.label} className="bg-ivory rounded-xl p-2.5">
                <span className="text-gold-600">{k.icon}</span>
                <p className="text-sm font-bold text-ink tabular-nums mt-1">{k.value}</p>
                <p className="text-[10px] text-slate-400">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา SKU / ชื่อสินค้า / rack..."
              className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-line bg-ivory/60 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {filteredRacks.map((r) => {
            const { qty, filled: skus, status } = rackMetrics(r);
            const tone = rackStatusTone[status];
            return (
              <button
                key={r.id}
                onClick={() => pickRack(r.id)}
                className={cn(
                  "flex items-center gap-2.5 w-full p-2.5 rounded-xl text-left transition-colors",
                  selected === r.id ? "bg-gold-50 ring-1 ring-gold-200" : "hover:bg-ivory"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                  r.zone === "A" ? "bg-[#3b5b7d]/10 text-[#3b5b7d]" : "bg-gold-100 text-gold-700"
                )}>
                  {r.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="block text-xs font-medium text-slate-800 truncate">
                      {skus.length === 0 ? "ว่าง" : skus.map((s) => s.name).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
                    </span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0", tone.className)}>
                      {tone.label}
                    </span>
                  </span>
                  <span className="block text-[10px] text-slate-400">{qty.toLocaleString()} ชิ้น · {skus.length} ช่อง</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D viewport */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* category legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-line shadow-sm px-3.5 py-2.5 space-y-1.5">
          {Object.entries(categoryColor).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-slate-600">{cat}</span>
            </div>
          ))}
        </div>

        {/* hint */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg border border-line px-3 py-1.5">
          <p className="text-[11px] text-slate-500">ลาก = หมุน · scroll = ซูม · คลิกชั้นวาง = ดูของละเอียด</p>
        </div>

        {/* Rack detail card */}
        {sel && (
          <div className="absolute top-3 right-3 bottom-3 w-[320px] max-w-[calc(100%-1.5rem)] bg-white/[0.98] backdrop-blur rounded-2xl border border-line shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-line shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Zone {sel.zone} · Rack</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">{sel.id}</h2>
                    {selMetrics && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", rackStatusTone[selMetrics.status].className)}>
                        {rackStatusTone[selMetrics.status].label}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={resetView} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selQty.toLocaleString()} ชิ้นในชั้นวางนี้</p>
              <div className="grid grid-cols-4 gap-1 mt-3 rounded-xl bg-ivory p-1">
                {[
                  ["stock", "Stock"],
                  ["pick", "Pick"],
                  ["movement", "Move"],
                  ["alerts", "Alert"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setRackTab(key as typeof rackTab)}
                    className={cn(
                      "h-7 rounded-lg text-[10px] font-semibold transition-colors",
                      rackTab === key ? "bg-white text-ink shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {rackTab === "stock" && [...sel.levels].map((slots, i) => ({ slots, level: i })).reverse().map(({ slots, level }) => (
                <div key={level}>
                  <p className="text-xs font-semibold text-slate-600 mb-2">ชั้นที่ {level + 1} {level === 0 ? "(ล่าง)" : level === LEVELS - 1 ? "(บน)" : ""}</p>
                  {slots.filter((s) => s.qty > 0).length === 0 ? (
                    <p className="text-xs text-slate-300 bg-ivory rounded-lg px-3 py-2.5">— ว่าง —</p>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((s) => (
                        <div key={s.sku + level} className={cn(
                          "rounded-xl border p-3",
                          s.qty === 0 ? "border-red-100 bg-red-50/50" : s.qty < 20 ? "border-amber-100 bg-amber-50/50" : "border-line bg-ivory/50"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: categoryColor[s.category] }} />
                            <p className="text-xs font-semibold text-slate-800 flex-1 truncate">{s.name}</p>
                            <p className={cn(
                              "text-sm font-bold tabular-nums",
                              s.qty === 0 ? "text-red-500" : s.qty < 20 ? "text-amber-600" : "text-ink"
                            )}>{s.qty}</p>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[10px] text-slate-400">{s.sku} · {s.category}</p>
                            {s.qty === 0 && <span className="text-[10px] font-semibold text-red-500">หมด</span>}
                            {s.qty > 0 && s.qty < 20 && <span className="text-[10px] font-semibold text-amber-600">ใกล้หมด</span>}
                          </div>
                          <div className="h-1 bg-white rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (s.qty / RACK_CAPACITY_PER_LEVEL) * 100)}%`,
                                backgroundColor: categoryColor[s.category],
                              }}
                            />
                          </div>
                          {s.qty > 0 && (
                            <button
                              onClick={() => addPick(sel.id, s)}
                              disabled={inPick(sel.id, s.sku)}
                              className="mt-2 w-full flex items-center justify-center gap-1 h-7 rounded-lg text-xs font-medium transition-colors bg-gold-50 text-gold-700 hover:bg-gold-100 disabled:opacity-50 disabled:cursor-default"
                            >
                              <Plus size={12} /> {inPick(sel.id, s.sku) ? "อยู่ในใบจัดของแล้ว" : "ใส่ใบจัดของ"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {rackTab === "pick" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-line bg-ivory/60 p-3">
                    <p className="text-xs font-semibold text-slate-700">ใบจัดของจาก rack นี้</p>
                    <p className="mt-1 text-[11px] text-slate-400">เลือกสินค้าจากแท็บ Stock แล้วกดใส่ใบจัดของ ระบบจะรวมไว้ด้านล่างของจอ</p>
                  </div>
                  {pickList.filter((p) => p.rackId === sel.id).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line py-10 text-center">
                      <ClipboardList size={22} className="mx-auto text-slate-300" />
                      <p className="mt-2 text-xs text-slate-400">ยังไม่มีรายการจาก rack นี้ในใบจัดของ</p>
                    </div>
                  ) : (
                    pickList.filter((p) => p.rackId === sel.id).map((p) => (
                      <div key={p.key} className="rounded-xl border border-gold-100 bg-gold-50/60 p-3">
                        <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{p.sku} · จำนวนจัด {p.qty} จาก {p.available}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
              {rackTab === "movement" && (
                <div className="space-y-2.5">
                  {[
                    { title: "รับสินค้าเข้า", sub: "PO mock · ตรวจจำนวนแล้ว", time: "วันนี้ 09:20" },
                    { title: "หยิบออกไป Packing", sub: "ใบจัดของล่าสุด / สาขาปลายทาง", time: "วันนี้ 13:45" },
                    { title: "Cycle count", sub: `ตรวจนับ ${sel.id} · ไม่พบส่วนต่าง`, time: "เมื่อวาน" },
                  ].map((m) => (
                    <div key={m.title} className="flex gap-3 rounded-xl bg-ivory/70 p-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-800">{m.title}</span>
                        <span className="block text-[11px] text-slate-500">{m.sub}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{m.time}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {rackTab === "alerts" && (
                <div className="space-y-2.5">
                  {sel.levels.flat().filter((s) => s.qty > 0 && s.qty < 20).length === 0 ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-700">ไม่มี stock alert ใน rack นี้</p>
                      <p className="mt-1 text-xs text-emerald-600/80">จำนวนสินค้าอยู่ในระดับปกติ</p>
                    </div>
                  ) : (
                    sel.levels.flat().filter((s) => s.qty > 0 && s.qty < 20).map((s) => (
                      <div key={s.sku} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-amber-800">{s.name}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">{s.sku} · เหลือ {s.qty} ชิ้น · ควรเติม stock</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ใบจัดของ (pick list) — เลือกของส่งหน้าสาขา */}
        {pickList.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[440px] max-w-[calc(100%-1.5rem)] bg-white/[0.98] backdrop-blur rounded-2xl border border-line shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line">
              <ClipboardList size={15} className="text-gold-600" />
              <p className="text-sm font-bold text-ink flex-1">ใบจัดของส่งสาขา · {pickList.length} รายการ</p>
              <button onClick={() => setPickList([])} className="text-xs text-slate-400 hover:text-red-500">ล้าง</button>
            </div>
            <div className="max-h-[176px] overflow-y-auto p-2 space-y-1.5">
              {pickList.map((p) => (
                <div key={p.key} className="flex items-center gap-2 bg-ivory/60 rounded-lg px-2.5 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: categoryColor[p.category] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-slate-800 truncate">{p.name}</span>
                    <span className="block text-[10px] text-slate-400">{p.rackId} · {p.sku} · เหลือ {p.available}</span>
                  </span>
                  <input
                    type="number" min={1} max={p.available} value={p.qty}
                    onChange={(e) => setPickQty(p.key, Number(e.target.value))}
                    className="w-14 h-7 rounded-md border border-line text-center text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                  <button onClick={() => removePick(p.key)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-line bg-ivory/40">
              <Truck size={14} className="text-slate-400 shrink-0" />
              <select
                value={destStore}
                onChange={(e) => setDestStore(e.target.value)}
                className="h-8 flex-1 min-w-0 rounded-lg border border-line bg-white text-xs text-slate-700 px-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {storeNames.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={confirmPick}
                className="h-8 px-3.5 rounded-lg bg-gold-600 text-white text-xs font-semibold hover:bg-gold-700 transition-colors shrink-0"
              >
                ยืนยันจัดของ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
