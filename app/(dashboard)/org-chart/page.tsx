"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow, Background, Controls, MiniMap, Panel,
  useNodesState, useEdgesState, addEdge, Handle, Position,
  type Node, type Edge, type Connection, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Pencil, Trash2, X, Network } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { orgNodes } from "@/lib/mock-org";
import { departments } from "@/lib/mock-db";

const avatarColors = [
  "bg-gold-100 text-gold-700", "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700", "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700", "bg-emerald-100 text-emerald-700",
];

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

interface OrgData {
  name: string;
  title: string;
  dept: string;
  initials: string;
  [key: string]: unknown;
}

type OrgCardProps = NodeProps & {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function OrgCardNode({ id, data, onEdit, onDelete }: OrgCardProps) {
  const d = data as OrgData;
  const colorIdx = parseInt(id.replace(/\D/g, ""), 10) % avatarColors.length || 0;
  return (
    <div className="group relative bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:border-gold-300 hover:shadow-md transition-all w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-gold-400 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2.5 p-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", avatarColors[colorIdx])}>
          {d.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{d.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{d.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{d.dept}</p>
        </div>
      </div>
      <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(id)} className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-500 hover:text-blue-600" title="แก้ไข">
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(id)} className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-500 hover:text-red-500" title="ลบ">
          <Trash2 size={12} />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gold-400 !w-2.5 !h-2.5" />
    </div>
  );
}

// auto layout จาก tree (parentId) → x,y
function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const childrenMap = new Map<string | null, typeof orgNodes>();
  for (const n of orgNodes) {
    const arr = childrenMap.get(n.parentId) ?? [];
    arr.push(n);
    childrenMap.set(n.parentId, arr);
  }
  const X_GAP = 230, Y_GAP = 150;
  const pos: Record<string, { x: number; y: number }> = {};
  let leafX = 0;
  const walk = (id: string, depth: number): number => {
    const kids = childrenMap.get(id) ?? [];
    if (kids.length === 0) {
      const x = leafX * X_GAP;
      leafX += 1;
      pos[id] = { x, y: depth * Y_GAP };
      return x;
    }
    const xs = kids.map((k) => walk(k.id, depth + 1));
    const x = (xs[0] + xs[xs.length - 1]) / 2;
    pos[id] = { x, y: depth * Y_GAP };
    return x;
  };
  (childrenMap.get(null) ?? []).forEach((r) => walk(r.id, 0));

  const nodes: Node[] = orgNodes.map((n) => ({
    id: n.id,
    type: "orgCard",
    position: pos[n.id] ?? { x: 0, y: 0 },
    data: { name: n.name, title: n.title, dept: n.departmentName, initials: n.avatarInitials },
  }));
  const edges: Edge[] = orgNodes
    .filter((n) => n.parentId)
    .map((n) => ({ id: `e-${n.parentId}-${n.id}`, source: n.parentId!, target: n.id, type: "smoothstep" }));
  return { nodes, edges };
}

interface EditState {
  id: string | null; // null = add
}

export default function OrgChartPage() {
  const toast = useToast();
  const initial = useMemo(() => buildGraph(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const [edit, setEdit] = useState<EditState | null>(null);
  const [form, setForm] = useState({ name: "", title: "", dept: departments[0].name });
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);

  const handleDelete = useCallback((id: string) => setDeleteNodeId(id), []);

  const confirmDeleteNode = () => {
    if (!deleteNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== deleteNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== deleteNodeId && e.target !== deleteNodeId));
    toast("ลบตำแหน่งแล้ว", "info");
    setDeleteNodeId(null);
  };

  const deleteNodeName = deleteNodeId ? (nodes.find((n) => n.id === deleteNodeId)?.data as OrgData | undefined)?.title : "";

  const onEditNode = useCallback((id: string) => {
    setNodes((prev) => {
      const node = prev.find((n) => n.id === id);
      if (node) {
        const d = node.data as OrgData;
        setForm({ name: d.name, title: d.title, dept: d.dept });
        setEdit({ id });
      }
      return prev;
    });
  }, [setNodes]);

  const nodeTypes = useMemo(
    () => ({
      orgCard: (props: NodeProps) => <OrgCardNode {...props} onEdit={onEditNode} onDelete={handleDelete} />,
    }),
    [onEditNode, handleDelete]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: "smoothstep" }, eds)),
    [setEdges]
  );

  const openAdd = () => {
    setForm({ name: "", title: "", dept: departments[0].name });
    setEdit({ id: null });
  };

  const submitEdit = () => {
    if (!form.name.trim() || !form.title.trim()) { toast("กรุณาใส่ชื่อและตำแหน่ง", "error"); return; }
    const initials = form.name.trim().slice(0, 2);
    if (edit?.id) {
      setNodes((prev) => prev.map((n) => n.id === edit.id
        ? { ...n, data: { ...n.data, name: form.name.trim(), title: form.title.trim(), dept: form.dept, initials } }
        : n));
      toast("บันทึกแล้ว");
    } else {
      const id = `node-${Date.now()}`;
      const offset = nodes.length * 12 % 120;
      setNodes((prev) => [...prev, {
        id, type: "orgCard",
        position: { x: 80 + offset, y: 60 + offset },
        data: { name: form.name.trim(), title: form.title.trim(), dept: form.dept, initials },
      }]);
      toast("เพิ่มตำแหน่งแล้ว — ลากเส้นเชื่อมสายบังคับบัญชาได้");
    }
    setEdit(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="ผังองค์กร" breadcrumbs={["บุคลากร", "ผังองค์กร"]} />

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onBeforeDelete={async ({ edges: delEdges }) => ({ nodes: [], edges: delEdges })}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-slate-50"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
          <MiniMap nodeColor="#a78bfa" maskColor="rgba(241,245,249,0.7)" className="!bg-white !border !border-slate-200 !rounded-lg" pannable zoomable />
          <Panel position="top-left">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center">
                <Network size={16} className="text-gold-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">ผังองค์กร</p>
                <p className="text-[10px] text-slate-400">ลากการ์ดวางอิสระ · ลากจุดเชื่อมสาย · Delete ลบ</p>
              </div>
              <Button size="sm" onClick={openAdd} className="ml-1">
                <Plus size={14} /> เพิ่มตำแหน่ง
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add/Edit modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEdit(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">{edit.id ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่งใหม่"}</h2>
              <button onClick={() => setEdit(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>ชื่อ-นามสกุล *</Label>
                <Input placeholder="เช่น สมหญิง รักดี" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>ตำแหน่ง *</Label>
                <Input placeholder="เช่น Marketing Officer" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>แผนก</Label>
                <select className={selectClass} value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
                  {departments.map((dep) => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
              <Button variant="outline" className="flex-1" onClick={() => setEdit(null)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={submitEdit}>{edit.id ? "บันทึก" : "เพิ่ม"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete node confirm */}
      {deleteNodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteNodeId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-500 mt-1">
              ลบ &ldquo;{deleteNodeName}&rdquo; ออกจากผังองค์กร? เส้นเชื่อมที่เกี่ยวข้องจะถูกลบด้วย
            </p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteNodeId(null)}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={confirmDeleteNode}>ลบ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
