import { NextRequest, NextResponse } from "next/server";
import {
  getPositions,
  getSummaryStats,
  createPosition,
  isCodeDuplicate,
  departments,
  branches,
} from "@/lib/mock-db";
import { positionSchema } from "@/lib/validations/position";

export async function GET() {
  const positions = getPositions();
  const stats = getSummaryStats();
  return NextResponse.json({ data: positions, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = positionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, departmentId, branchId } = parsed.data;

    if (isCodeDuplicate(code)) {
      return NextResponse.json({ error: "รหัสตำแหน่งนี้มีอยู่แล้ว" }, { status: 409 });
    }
    if (!departments.find((d) => d.id === departmentId)) {
      return NextResponse.json({ error: "ไม่พบแผนกนี้" }, { status: 400 });
    }
    if (!branches.find((b) => b.id === branchId)) {
      return NextResponse.json({ error: "ไม่พบสาขานี้" }, { status: 400 });
    }

    const position = createPosition(parsed.data);
    return NextResponse.json({ data: position }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
