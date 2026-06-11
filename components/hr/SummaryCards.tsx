import { Briefcase, Building2, UserPlus, Users, MapPin } from "lucide-react";
import type { SummaryStats } from "@/types";

interface SummaryCardsProps {
  stats: SummaryStats;
}

const cards = [
  {
    key: "totalPositions" as keyof SummaryStats,
    label: "ตำแหน่งทั้งหมด",
    icon: <Briefcase size={20} />,
    color: "text-gold-600",
    bg: "bg-gold-50",
  },
  {
    key: "totalDepartments" as keyof SummaryStats,
    label: "แผนกทั้งหมด",
    icon: <Building2 size={20} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "recruitingPositions" as keyof SummaryStats,
    label: "กำลังรับสมัคร",
    icon: <UserPlus size={20} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "totalEmployees" as keyof SummaryStats,
    label: "พนักงานทั้งหมด",
    icon: <Users size={20} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "totalBranches" as keyof SummaryStats,
    label: "สาขาทั้งหมด",
    icon: <MapPin size={20} />,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
              <span className={card.color}>{card.icon}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats[card.key]}</p>
          <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
