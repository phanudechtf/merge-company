"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { MockEmployee } from "@/lib/mock-employees";
import { cn } from "@/lib/utils";

interface EmployeePickerProps {
  employees: MockEmployee[];
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function EmployeePicker({ employees, value, onChange, error }: EmployeePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = value.map((id) => employees.find((e) => e.id === id)).filter(Boolean) as MockEmployee[];

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full min-h-9 rounded-md border bg-white px-3 py-1.5 text-sm text-left flex items-center gap-1.5 flex-wrap shadow-sm transition-colors",
          error ? "border-red-400" : "border-slate-200",
          open ? "ring-2 ring-gold-500 ring-offset-0 border-transparent" : ""
        )}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 flex-1">เลือกผู้รับผิดชอบ...</span>
        ) : (
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {selected.map((emp) => (
              <span
                key={emp.id}
                className="flex items-center gap-1 bg-gold-100 text-gold-800 text-xs px-1.5 py-0.5 rounded-full"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-gold-600 text-white flex items-center justify-center text-[7px] font-bold shrink-0">
                  {emp.avatarInitials.slice(0, 2)}
                </span>
                {emp.firstName}
                <button type="button" onClick={(e) => remove(emp.id, e)} className="hover:text-gold-600 ml-0.5">
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown
          size={13}
          className={cn("shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">ไม่มีพนักงานในแผนกนี้</p>
            ) : (
              employees.map((emp) => {
                const checked = value.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggle(emp.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left",
                      checked && "bg-gold-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors",
                        checked ? "bg-gold-600 border-gold-600" : "border-slate-300"
                      )}
                    >
                      {checked && <Check size={10} className="text-white" />}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center text-[9px] font-bold text-gold-700 shrink-0">
                      {emp.avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate text-xs">{emp.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{emp.positionName}</p>
                    </div>
                    {checked && <Check size={12} className="text-gold-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
