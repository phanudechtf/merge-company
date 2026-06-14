"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Link2, Image as ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmployeePicker } from "@/components/hr/EmployeePicker";
import { workOrderSchema, type WorkOrderSchema } from "@/lib/validations/work-order";
import { mockEmployees } from "@/lib/mock-employees";
import { departments } from "@/lib/mock-db";
import type { WorkOrder } from "@/lib/mock-work-orders";

interface WorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder | null;
  defaultDeptId?: string;
  onSuccess: (wo: WorkOrder) => void;
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-0 focus:border-transparent";

export function WorkOrderModal({ open, onOpenChange, workOrder, defaultDeptId, onSuccess }: WorkOrderModalProps) {
  const isEdit = !!workOrder;
  const toast = useToast();

  const {
    register, handleSubmit, reset, watch, setValue, control,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderSchema>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: "", description: "", priority: "medium",
      requesterId: "", requesterDeptId: "", assigneeIds: [], assigneeDeptId: "",
      startDate: "", dueDate: "", notes: "", attachments: [],
    },
  });

  const requesterId = watch("requesterId");
  const requesterDeptId = watch("requesterDeptId");
  const assigneeDeptId = watch("assigneeDeptId");
  const attachments = watch("attachments") ?? [];

  const fileRef = useRef<HTMLInputElement>(null);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) { toast("กรุณาใส่ลิงก์", "error"); return; }
    const name = linkName.trim() || url.replace(/^https?:\/\//, "").slice(0, 40);
    setValue("attachments", [...attachments, { name, url, kind: "link" as const }]);
    setLinkName(""); setLinkUrl("");
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("กรุณาเลือกไฟล์รูปภาพ", "error"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setValue("attachments", [...(watch("attachments") ?? []), { name: file.name, url: reader.result as string, kind: "image" as const }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setValue("attachments", attachments.filter((_, i) => i !== idx));
  };

  // requesterDeptId is always derived from the requester — never picked independently
  useEffect(() => {
    if (requesterId) {
      const emp = mockEmployees.find((e) => e.id === requesterId);
      setValue("requesterDeptId", emp?.departmentId ?? "", { shouldValidate: true });
    } else {
      setValue("requesterDeptId", "", { shouldValidate: true });
    }
  }, [requesterId, setValue]);

  useEffect(() => {
    if (open) {
      if (workOrder) {
        reset({
          title: workOrder.title, description: workOrder.description ?? "",
          priority: workOrder.priority,
          requesterId: workOrder.requesterId, requesterDeptId: workOrder.requesterDeptId,
          assigneeIds: workOrder.assigneeIds, assigneeDeptId: workOrder.assigneeDeptId,
          startDate: workOrder.startDate ? workOrder.startDate.slice(0, 10) : "",
          dueDate: workOrder.dueDate.slice(0, 10), notes: workOrder.notes ?? "",
          attachments: workOrder.attachments ?? [],
        });
      } else {
        reset({
          title: "", description: "", priority: "medium",
          requesterId: "", requesterDeptId: "",
          assigneeIds: [], assigneeDeptId: defaultDeptId ?? "",
          startDate: "", dueDate: "", notes: "", attachments: [],
        });
      }
    }
  }, [open, workOrder, reset, defaultDeptId]);

  const availableAssignees = assigneeDeptId
    ? mockEmployees.filter((e) => e.departmentId === assigneeDeptId)
    : mockEmployees;

  const onSubmit = async (data: WorkOrderSchema) => {
    try {
      const url = isEdit ? `/api/work-orders/${workOrder!.id}` : "/api/work-orders";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { toast(json.error ?? "เกิดข้อผิดพลาด", "error"); return; }
      onSuccess(json.data);
      onOpenChange(false);
    } catch { toast("เกิดข้อผิดพลาด กรุณาลองใหม่", "error"); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">{isEdit ? "แก้ไขการ์ดงาน" : "สร้างการ์ดงานใหม่"}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{isEdit ? workOrder!.code : "ระบบจะสร้างรหัสงานอัตโนมัติ"}</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">ชื่องาน *</Label>
              <Input id="title" placeholder="เช่น ขอซื้อ MacBook Pro สำหรับทีม Design" {...register("title")} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label>ความสำคัญ *</Label>
              <select className={selectClass} {...register("priority")}>
                <option value="low">ต่ำ</option>
                <option value="medium">ปกติ</option>
                <option value="high">สูง</option>
                <option value="urgent">ด่วน</option>
              </select>
            </div>

            {/* Requester row */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">ผู้สร้างงาน</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ชื่อผู้สร้าง *</Label>
                  <select className={selectClass} {...register("requesterId")}>
                    <option value="">เลือกคน</option>
                    {mockEmployees.map((e) => (
                      <option key={e.id} value={e.id}>{e.fullName} — {e.positionName}</option>
                    ))}
                  </select>
                  {errors.requesterId && <p className="text-xs text-red-500">{errors.requesterId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>แผนกผู้สร้าง *</Label>
                  <input type="hidden" {...register("requesterDeptId")} />
                  <div className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                    {requesterDeptId
                      ? departments.find((d) => d.id === requesterDeptId)?.name ?? requesterDeptId
                      : <span className="font-normal text-slate-400">เลือกผู้สร้างก่อน</span>}
                  </div>
                  {errors.requesterDeptId && <p className="text-xs text-red-500">{errors.requesterDeptId.message}</p>}
                </div>
              </div>
            </div>

            {/* Assignee row */}
            <div className="bg-gold-50/50 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-gold-700 uppercase tracking-wide">ผู้รับงาน</p>

              {/* Dept — locked when opened from a dept page */}
              <div className="space-y-1.5">
                <Label>แผนกผู้รับงาน *</Label>
                {defaultDeptId ? (
                  <div className="flex h-9 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 font-medium">
                    {departments.find((d) => d.id === defaultDeptId)?.name ?? defaultDeptId}
                  </div>
                ) : (
                  <select
                    className={selectClass}
                    value={assigneeDeptId}
                    onChange={(e) => {
                      setValue("assigneeDeptId", e.target.value, { shouldValidate: true });
                      setValue("assigneeIds", []);
                    }}
                  >
                    <option value="">เลือกแผนก</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
                {errors.assigneeDeptId && <p className="text-xs text-red-500">{errors.assigneeDeptId.message}</p>}
              </div>

              {/* Multi-select employee picker */}
              <div className="space-y-1.5">
                <Label>
                  ผู้รับผิดชอบงาน *{" "}
                  {assigneeDeptId && availableAssignees.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal normal-case">
                      ({availableAssignees.length} คนในแผนกนี้)
                    </span>
                  )}
                </Label>
                <Controller
                  control={control}
                  name="assigneeIds"
                  render={({ field }) => (
                    <EmployeePicker
                      employees={availableAssignees}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      error={errors.assigneeIds?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>วันเริ่มต้น</Label>
                <Input type="date" {...register("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label>กำหนดเสร็จ *</Label>
                <Input type="date" {...register("dueDate")} />
                {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>รายละเอียด</Label>
              <Textarea placeholder="อธิบายรายละเอียดของงาน..." rows={3} {...register("description")} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>หมายเหตุ</Label>
              <Textarea placeholder="หมายเหตุเพิ่มเติม..." rows={2} {...register("notes")} />
            </div>

            {/* Attachments & links */}
            <div className="space-y-2.5 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-1.5">
                <Paperclip size={13} className="text-slate-500" />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">ไฟล์แนบ & ลิงก์</p>
              </div>

              {/* Add link row */}
              <div className="flex gap-2">
                <Input className="flex-1" placeholder="ชื่อ (เช่น ใบเสนอราคา)" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
                <Input className="flex-[1.5]" placeholder="วางลิงก์ Google Drive / URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={addLink} className="shrink-0">
                  <Link2 size={14} /> เพิ่มลิงก์
                </Button>
              </div>

              {/* Upload image */}
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <ImageIcon size={14} /> แนบรูปภาพ
                </Button>
              </div>

              {/* List */}
              {attachments.length > 0 && (
                <div className="space-y-1.5">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-md px-2.5 py-1.5">
                      {a.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.url} alt={a.name} className="w-8 h-8 rounded object-cover shrink-0" />
                      ) : (
                        <span className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
                          <Link2 size={14} className="text-blue-600" />
                        </span>
                      )}
                      <span className="flex-1 min-w-0 text-xs text-slate-700 truncate">{a.name}</span>
                      <button type="button" onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างงาน"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
