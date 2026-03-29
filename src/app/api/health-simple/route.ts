import { NextResponse } from "next/server";

export async function GET() {
  console.log("[HEALTH] Health check called");
  return new NextResponse(JSON.stringify({ ok: true, time: Date.now() }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
