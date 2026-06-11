import { Header } from "@/components/layout/Header";
import { LayoutDashboard } from "lucide-react";
import { moduleConfigs } from "@/lib/module-configs";
import { ModuleView } from "@/components/hr/ModuleView";

const moduleNames: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "พนักงาน",
  departments: "แผนก",
  branches: "สาขา",
  schedules: "ตารางงาน",
  attendance: "บันทึกเวลา",
  leaves: "การลา",
  payroll: "เงินเดือน",
  overtime: "OT",
  commission: "ค่าคอมมิชชั่น",
  expenses: "เบิกค่าใช้จ่าย",
  recruitment: "สรรหา",
  applicants: "ผู้สมัคร",
  onboarding: "Onboarding",
  training: "อบรม",
  evaluation: "ประเมินผล",
  okr: "OKR",
  documents: "เอกสาร HR",
  assets: "ทรัพย์สิน",
  benefits: "สวัสดิการ",
  "social-security": "ประกันสังคม",
  announcements: "ประกาศ",
  reports: "รายงาน",
  users: "จัดการผู้ใช้",
  settings: "ตั้งค่า",
};

export default async function ModulePlaceholderPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: mod } = await params;

  if (moduleConfigs[mod]) {
    return <ModuleView moduleKey={mod} />;
  }

  const name = moduleNames[mod] ?? mod;

  return (
    <div className="flex flex-col h-full">
      <Header title={name} breadcrumbs={[name]} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <LayoutDashboard size={28} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-semibold text-lg">กำลังเตรียมโมดูลนี้</p>
          <p className="text-slate-400 text-sm mt-1">
            โมดูล <span className="font-medium text-gold-600">{name}</span> จะพร้อมใช้งานเร็วๆ นี้
          </p>
        </div>
      </div>
    </div>
  );
}
