import { Eye, Pencil, Trash2, Users, Banknote, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Position } from "@/types";

interface PositionCardProps {
  position: Position;
  onView: (p: Position) => void;
  onEdit: (p: Position) => void;
  onDelete: (p: Position) => void;
}

const statusConfig = {
  active: { label: "ทำงานอยู่", variant: "success" as const, bar: "bg-emerald-500" },
  inactive: { label: "ไม่ใช้งาน", variant: "default" as const, bar: "bg-slate-300" },
  recruiting: { label: "กำลังรับสมัคร", variant: "recruiting" as const, bar: "bg-blue-500" },
};

export function PositionCard({ position, onView, onEdit, onDelete }: PositionCardProps) {
  const status = statusConfig[position.status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col">
      {/* Status bar */}
      <div className={`h-1 w-full ${status.bar}`} />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-mono mb-0.5">{position.code}</p>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{position.name}</h3>
          </div>
          <Badge variant={status.variant} className="ml-2 shrink-0">
            {status.label}
          </Badge>
        </div>

        {/* Info rows */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building2 size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{position.department.name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 shrink-0">{position.jobLevel.name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Banknote size={13} className="text-slate-400 shrink-0" />
            <span>
              ฿{formatCurrency(position.salaryMin)} – ฿{formatCurrency(position.salaryMax)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{position.branch.name}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Users size={12} />
              <span>{position.employeeCount} คน</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            แก้ไข {formatDate(position.updatedAt)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-gold-600"
              onClick={() => onView(position)}
              title="ดูรายละเอียด"
            >
              <Eye size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-blue-600"
              onClick={() => onEdit(position)}
              title="แก้ไข"
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-500 hover:text-red-500"
              onClick={() => onDelete(position)}
              title="ลบ"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
