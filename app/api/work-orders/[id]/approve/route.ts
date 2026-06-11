import { NextRequest, NextResponse } from "next/server";
import { approveWorkOrder } from "@/lib/mock-work-orders";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const approverId = body.approverId ?? "emp-1";
  const updated = approveWorkOrder(id, approverId);
  if (!updated) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
