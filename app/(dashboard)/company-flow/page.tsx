"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowUpRight, GitBranch, Info, Network, UsersRound } from "lucide-react";
import { Header } from "@/components/layout/Header";
import {
  FLOW_CELL_X,
  FLOW_CELL_Y,
  companyFlowEdges,
  companyFlowNodes,
  flowDeptMeta,
  type CompanyFlowNode,
  type FlowDept,
} from "@/lib/company-flow-map";
import { cn } from "@/lib/utils";

const NODE_W = 188;
const NODE_H = 92;
const HANDLE_CLASS = "!h-2 !w-2 !border-0 !bg-transparent !opacity-0";

interface FlowNodeData extends CompanyFlowNode {
  color: string;
  soft: string;
  dim: boolean;
  focused: boolean;
  [key: string]: unknown;
}

function FlowHandles() {
  return (
    <>
      <Handle id="left-source" type="source" position={Position.Left} className={HANDLE_CLASS} />
      <Handle id="right-source" type="source" position={Position.Right} className={HANDLE_CLASS} />
      <Handle id="top-source" type="source" position={Position.Top} className={HANDLE_CLASS} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle id="left-target" type="target" position={Position.Left} className={HANDLE_CLASS} />
      <Handle id="right-target" type="target" position={Position.Right} className={HANDLE_CLASS} />
      <Handle id="top-target" type="target" position={Position.Top} className={HANDLE_CLASS} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={HANDLE_CLASS} />
    </>
  );
}

function CompanyNode({ data }: NodeProps) {
  const d = data as FlowNodeData;
  return (
    <div
      className={cn(
        "relative h-full w-full rounded-lg border bg-white px-3 py-2.5 shadow-sm transition-all",
        d.focused && "shadow-lg ring-2",
        d.dim && "opacity-35"
      )}
      style={{
        borderColor: d.focused ? d.color : "#d9e2ec",
        boxShadow: d.focused ? `0 12px 28px ${d.color}22` : undefined,
        ["--tw-ring-color" as string]: `${d.color}55`,
      }}
    >
      <FlowHandles />
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {flowDeptMeta[d.dept as FlowDept].label}
        </span>
      </div>
      <p className="line-clamp-2 text-[13px] font-bold leading-tight text-slate-900">{d.title}</p>
      <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-slate-500">{d.subtitle}</p>
      <div
        className="absolute bottom-0 left-0 h-1 w-full rounded-b-lg"
        style={{ background: `linear-gradient(90deg, ${d.color}, ${d.color}55)` }}
      />
    </div>
  );
}

const nodeTypes = { companyNode: CompanyNode };

function nodeCenter(node: CompanyFlowNode) {
  return {
    x: node.c * FLOW_CELL_X + NODE_W / 2,
    y: node.r * FLOW_CELL_Y + NODE_H / 2,
  };
}

function handlesFor(from: CompanyFlowNode, to: CompanyFlowNode) {
  const a = nodeCenter(from);
  const b = nodeCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0
      ? { sourceHandle: "right-source", targetHandle: "left-target" }
      : { sourceHandle: "left-source", targetHandle: "right-target" };
  }
  return dy > 0
    ? { sourceHandle: "bottom-source", targetHandle: "top-target" }
    : { sourceHandle: "top-source", targetHandle: "bottom-target" };
}

function buildNodes(selectedId: string | null): Node<FlowNodeData>[] {
  const related = selectedId
    ? new Set(
        companyFlowEdges
          .filter((e) => e.from === selectedId || e.to === selectedId)
          .flatMap((e) => [e.from, e.to])
      )
    : null;

  return companyFlowNodes.map((n) => {
    const meta = flowDeptMeta[n.dept];
    return {
      id: n.id,
      type: "companyNode",
      position: { x: n.c * FLOW_CELL_X, y: n.r * FLOW_CELL_Y },
      data: {
        ...n,
        color: meta.color,
        soft: meta.soft,
        focused: selectedId === n.id,
        dim: Boolean(selectedId && !related?.has(n.id)),
      },
      style: { width: NODE_W, height: NODE_H },
      draggable: false,
    };
  });
}

function buildEdges(selectedId: string | null): Edge[] {
  const byId = new Map(companyFlowNodes.map((n) => [n.id, n]));
  return companyFlowEdges.map((e, i) => {
    const from = byId.get(e.from)!;
    const to = byId.get(e.to)!;
    const active = !selectedId || e.from === selectedId || e.to === selectedId;
    const color = active ? flowDeptMeta[from.dept].color : "#cbd5e1";
    return {
      id: `edge-${i}`,
      source: e.from,
      target: e.to,
      ...handlesFor(from, to),
      type: "smoothstep",
      label: e.label,
      labelStyle: { fontSize: 10, fill: active ? "#334155" : "#94a3b8", fontWeight: 700 },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.92 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: color, strokeWidth: active ? 1.8 : 1.1, opacity: active ? 0.9 : 0.35 },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
      animated: Boolean(selectedId && active),
    };
  });
}

export default function CompanyFlowPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>("work-cards");
  const selected = companyFlowNodes.find((n) => n.id === selectedId) ?? null;
  const inbound = selected ? companyFlowEdges.filter((e) => e.to === selected.id) : [];
  const outbound = selected ? companyFlowEdges.filter((e) => e.from === selected.id) : [];

  const nodes = useMemo(() => buildNodes(selectedId), [selectedId]);
  const edges = useMemo(() => buildEdges(selectedId), [selectedId]);

  return (
    <div className="flex h-full flex-col">
      <Header title="ภาพรวม Flow บริษัท" breadcrumbs={["ภาพรวม", "Company Flow"]} />

      <div className="relative flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.12}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          proOptions={{ hideAttribution: true }}
          className="bg-slate-50"
        >
          <Background color="#d8dee8" gap={24} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => (n.data as FlowNodeData).color}
            maskColor="rgba(241,245,249,0.72)"
            className="!rounded-lg !border !border-slate-200 !bg-white"
            pannable
            zoomable
          />

          <Panel position="top-left">
            <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Network size={17} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Company Flow Map</p>
                  <p className="text-[11px] text-slate-500">คลิก node เพื่อดูเจ้าของงาน รายละเอียด และเส้นเชื่อม</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {(Object.keys(flowDeptMeta) as FlowDept[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      const first = companyFlowNodes.find((n) => n.dept === k);
                      if (first) setSelectedId(first.id);
                    }}
                    className="flex items-center gap-2 text-left text-[11px] text-slate-600 hover:text-slate-900"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: flowDeptMeta[k].color }} />
                    <span className="truncate">{flowDeptMeta[k].label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">อ่านแผนผัง</p>
                <LegendLine dot text="สี = กลุ่มแผนก" />
                <LegendLine arrow text="ลูกศร = การส่งงาน/ข้อมูล" />
                <LegendLine text="การ์ดงานกลาง = จุดรวมงานทุกแผนก" />
                <LegendLine text="Approval Hub = จุดอนุมัติร่วม" />
                <LegendLine text="Reports = จุดสรุปข้อมูลให้ผู้บริหาร" />
              </div>
            </div>
          </Panel>

          <Panel position="top-right">
            <div className="w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-slate-200 bg-white shadow-lg">
              {selected ? (
                <div>
                  <div className="border-b border-slate-100 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: flowDeptMeta[selected.dept].color }} />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        {flowDeptMeta[selected.dept].label}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{selected.subtitle}</p>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <UsersRound size={14} className="text-slate-400" />
                      <span className="font-medium">เจ้าของงาน:</span>
                      <span>{selected.owner}</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Info size={13} /> รายละเอียดที่ควรมี
                      </p>
                      <ul className="space-y-1.5">
                        {selected.bullets.map((b) => (
                          <li key={b} className="flex gap-2 text-sm text-slate-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: flowDeptMeta[selected.dept].color }} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <FlowList title="รับข้อมูลจาก" items={inbound.map((e) => `${titleOf(e.from)} → ${e.label}`)} />
                      <FlowList title="ส่งต่อไปที่" items={outbound.map((e) => `${e.label} → ${titleOf(e.to)}`)} />
                    </div>

                    {selected.href && (
                      <button
                        onClick={() => router.push(selected.href!)}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        เปิดหน้าที่เกี่ยวข้อง <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center">
                  <GitBranch size={24} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">เลือก node ในแผนผัง</p>
                  <p className="mt-1 text-xs text-slate-400">ระบบจะแสดง flow เข้า/ออกและรายละเอียดของแผนกนั้น</p>
                </div>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

function titleOf(id: string) {
  return companyFlowNodes.find((n) => n.id === id)?.title ?? id;
}

function FlowList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">ไม่มีเส้นเชื่อมโดยตรง</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <p key={item} className="text-xs leading-snug text-slate-600">{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function LegendLine({ text, dot, arrow }: { text: string; dot?: boolean; arrow?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[11px] leading-snug text-slate-600">
      {dot ? (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
      ) : arrow ? (
        <span className="relative h-px w-4 shrink-0 bg-slate-400 before:absolute before:-right-0.5 before:-top-1 before:h-2 before:w-2 before:rotate-45 before:border-r before:border-t before:border-slate-400" />
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-slate-300 bg-white" />
      )}
      <span>{text}</span>
    </div>
  );
}
