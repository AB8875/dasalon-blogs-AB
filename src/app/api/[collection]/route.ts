import { NextResponse } from "next/server";
import { getDb } from "@/lib/api";

const ALLOWED = new Set(["posts", "categories", "users"]);

export async function GET(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const { collection } = params;
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
    const db = await getDb();
    const query =
      search.length > 0
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
    return NextResponse.json({
      items,
      page,
      limit,
      total,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error fetching data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { collection: string } }
) {
  const { collection } = params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json(
      { error: "Collection not allowed" },
      { status: 400 }
    );
  }
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    // stamp basic timestamps if fields exist
    if (typeof body === "object" && body) {
      if ("updatedAt" in body) body.updatedAt = now;
      if ("createdAt" in body) body.createdAt = body.createdAt || now;
    }
    const db = await getDb();
    const result = await db.collection(collection).insertOne(body);
    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error creating" },
      { status: 500 }
    );
  }
}
