import { NextRequest, NextResponse } from "next/server";
import { rejectWorkOrder } from "@/lib/mock-work-orders";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { approverId = "emp-1", reason = "ไม่ระบุเหตุผล" } = body;
  const updated = rejectWorkOrder(id, approverId, reason);
  if (!updated) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
