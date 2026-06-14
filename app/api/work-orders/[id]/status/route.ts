import { NextRequest, NextResponse } from "next/server";
import { updateWorkOrderStatus, type WorkOrderStatus } from "@/lib/mock-work-orders";

type Ctx = { params: Promise<{ id: string }> };
const validStatuses = new Set<WorkOrderStatus>([
  "backlog",
  "in_progress",
  "done",
  "cancelled",
]);

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body as { status: WorkOrderStatus };
  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });
  if (!validStatuses.has(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const updated = updateWorkOrderStatus(id, status);
  if (!updated) return NextResponse.json({ error: "ไม่พบงานนี้" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
