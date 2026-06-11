import { z } from "zod";

export const workOrderSchema = z.object({
  title: z.string().min(1, "กรุณาใส่ชื่องาน").max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  requesterId: z.string().min(1, "กรุณาเลือกผู้สร้าง"),
  requesterDeptId: z.string().min(1, "กรุณาเลือกแผนกผู้สร้าง"),
  assigneeIds: z.array(z.string()).min(1, "กรุณาเลือกผู้รับงานอย่างน้อย 1 คน"),
  assigneeDeptId: z.string().min(1, "กรุณาเลือกแผนกผู้รับงาน"),
  startDate: z.string().optional(),
  dueDate: z.string().min(1, "กรุณาเลือกวันกำหนดส่ง"),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    kind: z.enum(["link", "image"]),
  })).optional(),
});

export type WorkOrderSchema = z.infer<typeof workOrderSchema>;
