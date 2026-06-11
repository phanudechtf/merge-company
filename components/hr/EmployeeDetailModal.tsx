import { X, Phone, Mail, Building2, MapPin, Briefcase, Calendar, BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { MockEmployee, EmployeeStatus } from "@/lib/mock-employees";

interface EmployeeDetailModalProps {
  employee: MockEmployee | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (e: MockEmployee) => void;
  onDelete?: (e: MockEmployee) => void;
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

export function EmployeeDetailModal({ employee, open, onClose, onEdit, onDelete }: EmployeeDetailModalProps) {
  if (!open || !employee) return null;

  const status = statusConfig[employee.status];
  const colorIdx = parseInt(employee.id.replace(/\D/g, ""), 10) % avatarColors.length;

  const fields = [
    { label: "แผนก", value: employee.departmentName, icon: <Building2 size={14} /> },
    { label: "ระดับงาน", value: employee.jobLevel, icon: <BadgeCheck size={14} /> },
    { label: "ตำแหน่ง", value: employee.positionName, icon: <Briefcase size={14} /> },
    { label: "สาขา", value: employee.branchName, icon: <MapPin size={14} /> },
    { label: "เริ่มงาน", value: formatDate(employee.startDate), icon: <Calendar size={14} /> },
    { label: "เพศ", value: employee.gender === "male" ? "ชาย" : "หญิง", icon: <BadgeCheck size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-gold-500 to-blue-500 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded hover:bg-white/15">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + name */}
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className={cn("w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-lg font-bold shrink-0", avatarColors[colorIdx])}>
              {employee.avatarInitials}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">{employee.fullName}</h2>
              <p className="text-sm text-slate-500">{employee.positionName}</p>
            </div>
            <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border shrink-0 mb-1", status.badge)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono mb-4">{employee.code}</p>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <a href={`tel:${employee.phone}`} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors">
              <Phone size={15} className="text-gold-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">โทรศัพท์</p>
                <p className="text-sm text-slate-700 truncate">{employee.phone}</p>
              </div>
            </a>
            <a href={`mailto:${employee.email}`} className="flex items-center gap-2 bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors">
              <Mail size={15} className="text-gold-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">อีเมล</p>
                <p className="text-sm text-slate-700 truncate">{employee.email}</p>
              </div>
            </a>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                  {f.icon}
                  <p className="text-[10px]">{f.label}</p>
                </div>
                <p className="text-sm font-medium text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-5">
            {onDelete && (
              <Button variant="outline" className="flex-1" onClick={() => onDelete(employee)}>
                <Trash2 size={14} /> ลบ
              </Button>
            )}
            {onEdit && (
              <Button className="flex-1" onClick={() => onEdit(employee)}>
                <Pencil size={14} /> แก้ไข
              </Button>
            )}
            {!onEdit && !onDelete && (
              <Button variant="outline" className="flex-1" onClick={onClose}>ปิด</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
