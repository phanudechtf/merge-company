"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEmployees } from "@/lib/mock-employees";
import type { ActionItem } from "@/lib/mock-meetings";

interface ActionItemsProps {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
}

const selectClass =
  "h-8 rounded-md border border-line bg-white px-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-gold-500";

export function ActionItems({ items, onChange }: ActionItemsProps) {
  const [text, setText] = useState("");

  function add() {
    const t = text.trim();
    if (!t) return;
    onChange([...items, { id: `ai-${Date.now()}`, text: t, done: false }]);
    setText("");
  }

  function update(id: string, patch: Partial<ActionItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && <p className="text-sm text-slate-400">ยังไม่มี action item</p>}
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-2">
          <button
            type="button"
            onClick={() => update(it.id, { done: !it.done })}
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
              it.done ? "border-gold-600 bg-gold-600 text-white" : "border-slate-300 bg-white"
            )}
          >
            {it.done && <Check size={13} />}
          </button>
          <span className={cn("flex-1 text-sm", it.done && "text-slate-400 line-through")}>{it.text}</span>
          <select
            value={it.assigneeId ?? ""}
            onChange={(e) => update(it.id, { assigneeId: e.target.value || undefined })}
            className={selectClass}
          >
            <option value="">— ผู้รับผิดชอบ —</option>
            {mockEmployees.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
          <button type="button" onClick={() => remove(it.id)} className="text-slate-400 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="เพิ่ม action item แล้วกด Enter"
          className="h-9 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-[#2a2a2a]"
        >
          <Plus size={15} /> เพิ่ม
        </button>
      </div>
    </div>
  );
}
