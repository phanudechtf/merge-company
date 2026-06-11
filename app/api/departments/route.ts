import { NextResponse } from "next/server";
import { departments } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ data: departments });
}
