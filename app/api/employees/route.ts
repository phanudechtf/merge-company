import { NextRequest, NextResponse } from "next/server";
import { mockEmployees } from "@/lib/mock-employees";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deptId = searchParams.get("deptId");
  const branchId = searchParams.get("branchId");
  const status = searchParams.get("status");

  let data = mockEmployees;
  if (deptId) data = data.filter((e) => e.departmentId === deptId);
  if (branchId) data = data.filter((e) => e.branchId === branchId);
  if (status) data = data.filter((e) => e.status === status);

  return NextResponse.json({
    data,
    total: data.length,
    stats: {
      total: mockEmployees.length,
      active: mockEmployees.filter((e) => e.status === "active").length,
      inactive: mockEmployees.filter((e) => e.status === "inactive").length,
      on_leave: mockEmployees.filter((e) => e.status === "on_leave").length,
    },
  });
}
