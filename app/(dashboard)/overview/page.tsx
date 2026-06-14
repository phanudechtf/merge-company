"use client";

import { useMemo } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, Panel,
  Handle, Position, MarkerType,
  type Node, type Edge, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Workflow } from "lucide-react";
import { Header } from "@/components/layout/Header";
import {
  rawNodes, rawEdges, domainMeta, statusMeta, CELL_X, CELL_Y,
  type RawNode, type NodeKind, type ModStatus,
} from "@/lib/system-map";

// reference column / row size used to center every node in its grid cell
const COL_W = 156;
const ROW_H = 44;

const SIZE: Record<NodeKind, { w: number; h: number }> = {
  entity: { w: 156, h: 46 },
  process: { w: 150, h: 42 },
  decision: { w: 84, h: 84 },
  terminal: { w: 130, h: 38 },
};

const domainColor = (id: string) => domainMeta.find((d) => d.id === id)?.color ?? "#94a3b8";

function center(n: RawNode) {
  return {
    x: n.c * CELL_X + COL_W / 2,
    y: n.r * CELL_Y + ROW_H / 2,
  };
}

// ── shared handles (8 = 4 sides × source/target), invisible anchors ──
const HANDLE = "!w-1.5 !h-1.5 !min-w-0 !min-h-0 !border-0 !bg-transparent !opacity-0";
function NodeHandles() {
  return (
    <>
      <Handle id="ls" type="source" position={Position.Left} className={HANDLE} />
      <Handle id="rs" type="source" position={Position.Right} className={HANDLE} />
      <Handle id="ts" type="source" position={Position.Top} className={HANDLE} />
      <Handle id="bs" type="source" position={Position.Bottom} className={HANDLE} />
      <Handle id="lt" type="target" position={Position.Left} className={HANDLE} />
      <Handle id="rt" type="target" position={Position.Right} className={HANDLE} />
      <Handle id="tt" type="target" position={Position.Top} className={HANDLE} />
      <Handle id="bt" type="target" position={Position.Bottom} className={HANDLE} />
    </>
  );
}

interface NData {
  label: string;
  kind: NodeKind;
  color: string;
  status?: ModStatus;
  href?: string;
  dim?: boolean;
  focus?: boolean;
  [key: string]: unknown;
}

function EntityNode({ data }: NodeProps) {
  const d = data as NData;
  const meta = d.status ? statusMeta[d.status] : null;
  return (
    <div className="relative w-full h-full flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 shadow-sm">
      <NodeHandles />
      {meta && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} title={meta.label} />}
      <span className="text-[12px] font-semibold text-slate-700 leading-tight truncate flex-1">{d.label}</span>
    </div>
  );
}

function ProcessNode({ data }: NodeProps) {
  const d = data as NData;
  return (
    <div
      className="relative w-full h-full flex items-center justify-center rounded-md border"
      style={{ borderColor: d.color, background: `${d.color}14` }}
    >
      <NodeHandles />
      <span className="text-[11.5px] font-medium text-slate-700 leading-tight text-center px-1.5">{d.label}</span>
    </div>
  );
}

function TerminalNode({ data }: NodeProps) {
  const d = data as NData;
  return (
    <div
      className="relative w-full h-full flex items-center justify-center rounded-full border"
      style={{ borderColor: d.color, background: "white" }}
    >
      <NodeHandles />
      <span className="text-[11px] font-semibold leading-tight text-center px-1" style={{ color: d.color }}>{d.label}</span>
    </div>
  );
}

function DecisionNode({ data }: NodeProps) {
  const d = data as NData;
  return (
    <div className="relative w-full h-full">
      <NodeHandles />
      <div
        className="absolute inset-2 rotate-45 rounded-md border-2 bg-white shadow-sm"
        style={{ borderColor: d.color }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold leading-tight text-center" style={{ color: d.color }}>{d.label}</span>
      </div>
    </div>
  );
}

function DomainBoxNode({ data }: NodeProps) {
  const d = data as { label: string; color: string };
  return (
    <div
      className="w-full h-full rounded-2xl border-2 pointer-events-none"
      style={{ borderColor: `${d.color}66`, background: `${d.color}0a` }}
    >
      <span
        className="absolute -top-2.5 left-4 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
        style={{ background: d.color }}
      >
        {d.label}
      </span>
    </div>
  );
}

// pick source/target handle ids from geometry
function handlesFor(a: RawNode, b: RawNode) {
  const ca = center(a), cb = center(b);
  const dx = cb.x - ca.x, dy = cb.y - ca.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? { s: "rs", t: "lt" } : { s: "ls", t: "rt" };
  }
  return dy > 0 ? { s: "bs", t: "tt" } : { s: "ts", t: "bt" };
}

function buildBase(): { nodes: Node[]; edges: Edge[] } {
  const byId = new Map(rawNodes.map((n) => [n.id, n]));

  // domain background boxes (computed from member bounds)
  const PAD = 14, HEAD = 14;
  const boxes: Node[] = domainMeta.map((dom) => {
    const members = rawNodes.filter((n) => n.domain === dom.id);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of members) {
      const { w, h } = SIZE[n.kind];
      const cx = n.c * CELL_X + COL_W / 2;
      const cy = n.r * CELL_Y + ROW_H / 2;
      minX = Math.min(minX, cx - w / 2);
      minY = Math.min(minY, cy - h / 2);
      maxX = Math.max(maxX, cx + w / 2);
      maxY = Math.max(maxY, cy + h / 2);
    }
    return {
      id: `box-${dom.id}`,
      type: "domainBox",
      position: { x: minX - PAD, y: minY - PAD - HEAD },
      data: { label: dom.label, color: dom.color },
      style: { width: maxX - minX + PAD * 2, height: maxY - minY + PAD * 2 + HEAD },
      draggable: false,
      selectable: false,
      zIndex: -1,
    } as Node;
  });

  const nodes: Node[] = rawNodes.map((n) => {
    const { w, h } = SIZE[n.kind];
    const cx = n.c * CELL_X + COL_W / 2;
    const cy = n.r * CELL_Y + ROW_H / 2;
    const type = n.kind === "entity" ? "entityNode"
      : n.kind === "process" ? "processNode"
      : n.kind === "decision" ? "decisionNode" : "terminalNode";
    return {
      id: n.id,
      type,
      position: { x: cx - w / 2, y: cy - h / 2 },
      data: { label: n.label, kind: n.kind, color: domainColor(n.domain), status: n.status, href: n.href },
      style: { width: w, height: h },
      draggable: false,
    };
  });

  const edges: Edge[] = rawEdges.map((e, i) => {
    const a = byId.get(e.from)!, b = byId.get(e.to)!;
    const { s, t } = handlesFor(a, b);
    return {
      id: `e${i}`,
      source: e.from,
      target: e.to,
      sourceHandle: s,
      targetHandle: t,
      type: "smoothstep",
      data: { label: e.label, color: domainColor(a.domain) },
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
    };
  });

  return { nodes: [...boxes, ...nodes], edges };
}

const nodeTypes = {
  entityNode: EntityNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
  terminalNode: TerminalNode,
  domainBox: DomainBoxNode,
};

export default function OverviewPage() {
  const base = useMemo(() => buildBase(), []);

  const nodes = base.nodes;
  const edges = useMemo(
    () =>
      base.edges.map((e) => {
        const label = (e.data as { label?: string })?.label;
        return {
          ...e,
          label,
          labelStyle: { fontSize: 9.5, fill: "#475569", fontWeight: 600 },
          labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.92 },
          labelBgPadding: [3, 1] as [number, number],
          labelBgBorderRadius: 3,
          style: { stroke: "#aab4c0", strokeWidth: 1.4 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#aab4c0", width: 13, height: 13 },
        };
      }),
    [base.edges]
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="ภาพรวมระบบ" breadcrumbs={["ภาพรวม", "ภาพรวมระบบ"]} />

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.15}
          maxZoom={1.6}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={22} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => ((n.data as { color?: string })?.color ?? "#cbd5e1")}
            maskColor="rgba(241,245,249,0.7)"
            className="!bg-white !border !border-slate-200 !rounded-lg"
            pannable
            zoomable
          />
          <Panel position="top-left">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-3.5 py-3 max-w-[270px]">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Workflow size={16} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">ภาพรวมระบบ MERGE</p>
                  <p className="text-[10px] text-slate-400">ชี้โมดูล → ไฮไลต์เส้นที่เชื่อม · คลิก → เปิดหน้า</p>
                </div>
              </div>

              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">ชนิดโหนด</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2.5">
                <Legend swatch={<span className="w-3.5 h-3 rounded-sm border border-slate-300 bg-white" />} text="โมดูล (หน้า)" />
                <Legend swatch={<span className="w-3.5 h-3 rounded-sm border border-indigo-300 bg-indigo-50" />} text="ขั้นตอน" />
                <Legend swatch={<span className="w-3 h-3 rotate-45 rounded-[2px] border-2 border-slate-400 bg-white" />} text="ตัดสินใจ" />
                <Legend swatch={<span className="w-3.5 h-3 rounded-full border border-slate-400 bg-white" />} text="สถานะจบ" />
              </div>

              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">สถานะโมดูล</p>
              <div className="space-y-1">
                {(Object.keys(statusMeta) as ModStatus[]).map((k) => (
                  <Legend
                    key={k}
                    swatch={<span className="w-2.5 h-2.5 rounded-full" style={{ background: statusMeta[k].color }} />}
                    text={statusMeta[k].label}
                  />
                ))}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

function Legend({ swatch, text }: { swatch: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 flex items-center justify-center w-3.5">{swatch}</span>
      <span className="text-[11px] text-slate-600 leading-tight">{text}</span>
    </div>
  );
}
