import { NextRequest, NextResponse } from "next/server";
import {
  getPositionById,
  updatePosition,
  deletePosition,
  isCodeDuplicate,
  departments,
  branches,
} from "@/lib/mock-db";
import { positionSchema } from "@/lib/validations/position";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const position = getPositionById(id);
  if (!position) return NextResponse.json({ error: "ไม่พบตำแหน่งนี้" }, { status: 404 });
  return NextResponse.json({ data: position });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = getPositionById(id);
    if (!existing) return NextResponse.json({ error: "ไม่พบตำแหน่งนี้" }, { status: 404 });

    const body = await req.json();
    const parsed = positionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code, departmentId, branchId } = parsed.data;

    if (isCodeDuplicate(code, id)) {
      return NextResponse.json({ error: "รหัสตำแหน่งนี้มีอยู่แล้ว" }, { status: 409 });
    }
    if (!departments.find((d) => d.id === departmentId)) {
      return NextResponse.json({ error: "ไม่พบแผนกนี้" }, { status: 400 });
    }
    if (!branches.find((b) => b.id === branchId)) {
      return NextResponse.json({ error: "ไม่พบสาขานี้" }, { status: 400 });
    }

    const updated = updatePosition(id, parsed.data);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = deletePosition(id);
  if (!deleted) return NextResponse.json({ error: "ไม่พบตำแหน่งนี้" }, { status: 404 });
  return NextResponse.json({ message: "ลบตำแหน่งสำเร็จ" });
}
