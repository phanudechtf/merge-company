import { z } from "zod";

export const positionSchema = z
  .object({
    code: z.string().min(1, "กรุณาใส่รหัสตำแหน่ง").max(20, "รหัสไม่เกิน 20 ตัวอักษร"),
    name: z.string().min(1, "กรุณาใส่ชื่อตำแหน่ง").max(100, "ชื่อไม่เกิน 100 ตัวอักษร"),
    departmentId: z.string().min(1, "กรุณาเลือกแผนก"),
    branchId: z.string().min(1, "กรุณาเลือกสาขา"),
    jobLevelId: z.string().min(1, "กรุณาเลือกระดับงาน"),
    salaryMin: z.coerce.number().min(0, "เงินเดือนต้องมากกว่า 0"),
    salaryMax: z.coerce.number().min(0, "เงินเดือนต้องมากกว่า 0"),
    status: z.enum(["active", "inactive", "recruiting"]),
    description: z.string().optional(),
    requirements: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: "เงินเดือนสูงสุดต้องมากกว่าหรือเท่ากับเงินเดือนต่ำสุด",
    path: ["salaryMax"],
  });

export type PositionSchema = z.infer<typeof positionSchema>;
