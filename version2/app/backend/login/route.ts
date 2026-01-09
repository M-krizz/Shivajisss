import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  const contentType = res.headers.get("content-type") || "application/json"
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": contentType },
  })
}
