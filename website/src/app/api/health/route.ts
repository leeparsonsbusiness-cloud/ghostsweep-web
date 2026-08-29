import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "GhostSweep API",
    version: "2.4.0",
    manifest: "v3",
    timestamp: new Date().toISOString(),
  });
}
