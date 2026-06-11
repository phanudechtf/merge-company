import { NextRequest, NextResponse } from "next/server";
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from "@/lib/mock-work-orders";
import { workOrderSchema } from "@/lib/validations/work-order";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const wo = getWorkOrderById(id);
  if (!wo) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
  return NextResponse.json({ data: wo });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    if (!getWorkOrderById(id)) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
    const body = await req.json();
    const parsed = workOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const updated = updateWorkOrder(id, parsed.data);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = deleteWorkOrder(id);
  if (!deleted) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
