"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { positionSchema, type PositionSchema } from "@/lib/validations/position";
import type { Department, Branch, JobLevel, Position } from "@/types";

interface PositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
  departments: Department[];
  branches: Branch[];
  jobLevels: JobLevel[];
  onSuccess: (position: Position) => void;
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

export function PositionModal({
  open,
  onOpenChange,
  position,
  departments,
  branches,
  jobLevels,
  onSuccess,
}: PositionModalProps) {
  const isEdit = !!position;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PositionSchema>({
    resolver: zodResolver(positionSchema) as Resolver<PositionSchema>,
    defaultValues: {
      code: "",
      name: "",
      departmentId: "",
      branchId: "",
      jobLevelId: "",
      salaryMin: 0,
      salaryMax: 0,
      status: "active",
      description: "",
      requirements: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (position) {
        reset({
          code: position.code,
          name: position.name,
          departmentId: position.departmentId,
          branchId: position.branchId,
          jobLevelId: position.jobLevelId,
          salaryMin: position.salaryMin,
          salaryMax: position.salaryMax,
          status: position.status,
          description: position.description ?? "",
          requirements: position.requirements ?? "",
          notes: position.notes ?? "",
        });
      } else {
        reset({
          code: "",
          name: "",
          departmentId: "",
          branchId: "",
          jobLevelId: "",
          salaryMin: 0,
          salaryMax: 0,
          status: "active",
          description: "",
          requirements: "",
          notes: "",
        });
      }
    }
  }, [open, position, reset]);

  const onSubmit = async (data: PositionSchema) => {
    try {
      const url = isEdit ? `/api/positions/${position!.id}` : "/api/positions";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      onSuccess(json.data);
      onOpenChange(false);
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งงาน"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? `แก้ไข ${position!.code}` : "สร้างตำแหน่งงานใหม่"}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-md p-1 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Row 1: Code + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">รหัสตำแหน่ง *</Label>
                <Input
                  id="code"
                  placeholder="เช่น IT-001"
                  {...register("code")}
                />
                {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">ชื่อตำแหน่ง *</Label>
                <Input
                  id="name"
                  placeholder="เช่น Software Developer"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            {/* Row 2: Department + Job Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="departmentId">แผนก *</Label>
                <select id="departmentId" className={selectClass} {...register("departmentId")}>
                  <option value="">เลือกแผนก</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-xs text-red-500">{errors.departmentId.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobLevelId">ระดับงาน *</Label>
                <select id="jobLevelId" className={selectClass} {...register("jobLevelId")}>
                  <option value="">เลือกระดับงาน</option>
                  {jobLevels.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {errors.jobLevelId && (
                  <p className="text-xs text-red-500">{errors.jobLevelId.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salaryMin">เงินเดือนต่ำสุด (฿) *</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="25000"
                  {...register("salaryMin")}
                />
                {errors.salaryMin && (
                  <p className="text-xs text-red-500">{errors.salaryMin.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salaryMax">เงินเดือนสูงสุด (฿) *</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="50000"
                  {...register("salaryMax")}
                />
                {errors.salaryMax && (
                  <p className="text-xs text-red-500">{errors.salaryMax.message}</p>
                )}
              </div>
            </div>

            {/* Row 4: Branch + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="branchId">สาขา *</Label>
                <select id="branchId" className={selectClass} {...register("branchId")}>
                  <option value="">เลือกสาขา</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="text-xs text-red-500">{errors.branchId.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">สถานะ *</Label>
                <select id="status" className={selectClass} {...register("status")}>
                  <option value="active">ทำงานอยู่</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="recruiting">กำลังรับสมัคร</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">รายละเอียดงาน</Label>
              <Textarea
                id="description"
                placeholder="อธิบายความรับผิดชอบหลักของตำแหน่งนี้..."
                rows={3}
                {...register("description")}
              />
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              <Label htmlFor="requirements">คุณสมบัติ</Label>
              <Textarea
                id="requirements"
                placeholder="การศึกษา ประสบการณ์ ทักษะที่ต้องการ..."
                rows={3}
                {...register("requirements")}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                placeholder="หมายเหตุเพิ่มเติม..."
                rows={2}
                {...register("notes")}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่ง"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
