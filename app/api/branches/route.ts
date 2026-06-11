import { NextResponse } from "next/server";
import { branches } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ data: branches });
}
