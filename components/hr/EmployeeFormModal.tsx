"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { departments, branches, jobLevels } from "@/lib/mock-db";
import type { MockEmployee, EmployeeStatus } from "@/lib/mock-employees";

interface EmployeeFormModalProps {
  open: boolean;
  employee?: MockEmployee | null;
  onClose: () => void;
  onSave: (emp: MockEmployee) => void;
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

const emptyForm = {
  code: "", firstName: "", lastName: "",
  departmentId: departments[0].id, branchId: branches[0].id,
  positionName: "", jobLevel: jobLevels[4].name,
  status: "active" as EmployeeStatus, gender: "male" as "male" | "female",
  phone: "", email: "",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function EmployeeFormModal({ open, employee, onClose, onSave }: EmployeeFormModalProps) {
  const toast = useToast();
  const isEdit = !!employee;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setForm({
        code: employee.code, firstName: employee.firstName, lastName: employee.lastName,
        departmentId: employee.departmentId, branchId: employee.branchId,
        positionName: employee.positionName, jobLevel: employee.jobLevel,
        status: employee.status, gender: employee.gender,
        phone: employee.phone, email: employee.email,
      });
    } else {
      setForm({ ...emptyForm, code: `EMP-${String(Math.floor(Math.random() * 900) + 100)}` });
    }
  }, [open, employee]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { toast("กรุณาใส่ชื่อและนามสกุล", "error"); return; }
    if (!form.positionName.trim()) { toast("กรุณาใส่ตำแหน่ง", "error"); return; }

    const dept = departments.find((d) => d.id === form.departmentId)!;
    const branch = branches.find((b) => b.id === form.branchId)!;
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    const emp: MockEmployee = {
      id: employee?.id ?? `emp-new-${Date.now()}`,
      code: form.code.trim() || `EMP-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName,
      departmentId: dept.id, departmentName: dept.name,
      branchId: branch.id, branchName: branch.name,
      positionName: form.positionName.trim(),
      jobLevel: form.jobLevel,
      avatarInitials: form.firstName.trim().slice(0, 2),
      status: form.status,
      phone: form.phone.trim(),
      email: form.email.trim(),
      startDate: employee?.startDate ?? todayStr(),
      gender: form.gender,
    };
    onSave(emp);
    toast(isEdit ? "บันทึกการแก้ไขแล้ว" : "เพิ่มพนักงานแล้ว");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? "แก้ไขพนักงาน" : "เพิ่มพนักงานใหม่"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>รหัสพนักงาน</Label>
              <Input value={form.code} onChange={(e) => set("code", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>สถานะ</Label>
              <select className={selectClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">ทำงานอยู่</option>
                <option value="on_leave">ลาพัก</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ชื่อ *</Label>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="ชื่อจริง" />
            </div>
            <div className="space-y-1.5">
              <Label>นามสกุล *</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="นามสกุล" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>แผนก</Label>
              <select className={selectClass} value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>สาขา</Label>
              <select className={selectClass} value={form.branchId} onChange={(e) => set("branchId", e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ตำแหน่ง *</Label>
              <Input value={form.positionName} onChange={(e) => set("positionName", e.target.value)} placeholder="เช่น Sales Officer" />
            </div>
            <div className="space-y-1.5">
              <Label>ระดับงาน</Label>
              <select className={selectClass} value={form.jobLevel} onChange={(e) => set("jobLevel", e.target.value)}>
                {jobLevels.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>เพศ</Label>
              <select className={selectClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>เบอร์โทร</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>อีเมล</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@senseasia.com" />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
          <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
          <Button className="flex-1" onClick={submit}>{isEdit ? "บันทึก" : "เพิ่มพนักงาน"}</Button>
        </div>
      </div>
    </div>
  );
}
