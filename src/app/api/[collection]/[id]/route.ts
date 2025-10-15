import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Db } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { AwardIcon } from "lucide-react";

const ALLOWED = new Set(["posts", "categories", "users"]);

// GET /api/[collection]/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await context.params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }

  try {
    const db = (await getDb()) as Db;
    const item = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });
    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error fetching item" },
      { status: 500 }
    );
  }
}

// PATCH /api/[collection]/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await context.params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    const db = (await getDb()) as Db;
    const result = await db
      .collection(collection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      );

    if (!result?.value)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error updating" },
      { status: 500 }
    );
  }
}

// DELETE /api/[collection]/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection, id } = await context.params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }

  try {
    const db = (await getDb()) as Db;
    const result = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error deleting" },
      { status: 500 }
    );
  }
}
