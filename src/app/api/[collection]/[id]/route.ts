// path: src/app/api/[collection]/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/api"; // ✅ Correct import

const COLLECTIONS = ["blogs", "users", "posts"];

export async function GET(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;

  if (!COLLECTIONS.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const item = await db
      .collection(collection)
      .findOne({ _id: new ObjectId(id) });

    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;

  if (!COLLECTIONS.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { collection: string; id: string } }
) {
  const { collection, id } = params;
  const data = await req.json();

  if (!COLLECTIONS.includes(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const db = await getDb();

    const result = await db
      .collection(collection)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      );

    // ✅ Safely handle the case where result or result.value might be null
    if (!result || !result.value) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
