import { NextRequest, NextResponse } from "next/server";
import { getWorkOrders, getWorkOrderStats, createWorkOrder } from "@/lib/mock-work-orders";
import { workOrderSchema } from "@/lib/validations/work-order";

export async function GET(req: NextRequest) {
  const deptId = new URL(req.url).searchParams.get("deptId");
  let data = getWorkOrders();
  if (deptId) data = data.filter((w) => w.assigneeDeptId === deptId);
  const stats = {
    total: data.length,
    pendingApproval: data.filter((w) => w.status === "pending_approval").length,
    approved: data.filter((w) => w.status === "approved").length,
    inProgress: data.filter((w) => w.status === "in_progress").length,
    done: data.filter((w) => w.status === "done").length,
  };
  return NextResponse.json({ data, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = workOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    const wo = createWorkOrder(parsed.data);
    return NextResponse.json({ data: wo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
