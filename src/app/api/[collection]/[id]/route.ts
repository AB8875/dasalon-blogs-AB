import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const ALLOWED = new Set(["posts", "categories", "users"]);

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return id; // allow string ids if inserted as strings
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }
  try {
    const db = await getDb();
    const doc = await db
      .collection(collection)
      .findOne({ _id: toObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error fetching" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }
  try {
    const body = await req.json();
    if (typeof body === "object" && body)
      body.updatedAt = new Date().toISOString();
    const db = await getDb();
    const result = await db
      .collection(collection)
      .findOneAndUpdate(
        { _id: toObjectId(id) },
        { $set: body },
        { returnDocument: "after" }
      );
    if (!result.value)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result.value);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error updating" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }
  try {
    const db = await getDb();
    const result = await db
      .collection(collection)
      .deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error deleting" },
      { status: 500 }
    );
  }
}
