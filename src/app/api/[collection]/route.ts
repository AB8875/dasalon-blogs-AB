import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Db } from "mongodb";

const ALLOWED = new Set(["posts", "categories", "users"]);

// GET /api/[collection]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  const { collection } = await context.params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || 20))
  );
  const search = url.searchParams.get("q")?.trim()?.toLowerCase() || "";

  try {
    const db = (await getDb()) as Db;
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const cursor = db
      .collection(collection)
      .find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([
      cursor.toArray(),
      db.collection(collection).countDocuments(query),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error fetching data" },
      { status: 500 }
    );
  }
}

// POST /api/[collection]
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  const { collection } = await context.params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const now = new Date().toISOString();

    if (body && typeof body === "object") {
      if (!("createdAt" in body)) body.createdAt = now;
      body.updatedAt = now;
    }

    const db = (await getDb()) as Db;
    const result = await db.collection(collection).insertOne(body);

    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error creating" },
      { status: 500 }
    );
  }
}
