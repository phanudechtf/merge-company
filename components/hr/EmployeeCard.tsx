import { Eye, Phone, Mail, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockEmployee, EmployeeStatus } from "@/lib/mock-employees";

interface EmployeeCardProps {
  employee: MockEmployee;
  onView: (e: MockEmployee) => void;
}

const statusConfig: Record<EmployeeStatus, { label: string; dot: string; badge: string }> = {
  active:   { label: "ทำงานอยู่", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  inactive: { label: "ไม่ใช้งาน", dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-600 border-slate-200" },
  on_leave: { label: "ลาพัก",     dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-100" },
};

const avatarColors = [
  "bg-gold-100 text-gold-700", "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700", "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700", "bg-emerald-100 text-emerald-700",
];

export function EmployeeCard({ employee, onView }: EmployeeCardProps) {
  const status = statusConfig[employee.status];
  const colorIdx = parseInt(employee.id.replace(/\D/g, ""), 10) % avatarColors.length;

  return (
    <button
      onClick={() => onView(employee)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 text-left flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0", avatarColors[colorIdx])}>
          {employee.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-mono">{employee.code}</p>
          <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{employee.fullName}</h3>
          <p className="text-xs text-slate-500 truncate">{employee.positionName}</p>
        </div>
        <span className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0", status.badge)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Building2 size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{employee.departmentName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{employee.jobLevel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{employee.branchName}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3">
          <Phone size={12} />
          <Mail size={12} />
        </div>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-gold-600 transition-colors">
          <Eye size={12} /> ดูรายละเอียด
        </span>
      </div>
    </button>
  );
}
