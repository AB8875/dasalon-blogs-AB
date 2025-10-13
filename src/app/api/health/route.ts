import { NextResponse } from "next/server";
import { getDb } from "@/lib/api";

export async function GET() {
  try {
    const db = await getDb();
    const colls = await db.listCollections().toArray();
    return NextResponse.json({
      ok: true,
      collections: colls.map((c) => c.name),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "error" },
      { status: 500 }
    );
  }
}
