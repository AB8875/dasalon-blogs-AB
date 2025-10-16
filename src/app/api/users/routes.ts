import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const users = await db
      .collection("users")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json(users); // ✅ return array directly
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    const newUser = {
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection("users").insertOne(newUser);
    return NextResponse.json({ message: "User added successfully" });
  } catch (err) {
    console.error("Error adding user:", err);
    return NextResponse.json(
      { message: "Failed to add user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    const { id, ...rest } = body;

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...rest, updated_at: new Date() } }
      );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ message: "ID is required" }, { status: 400 });

    const db = await getDb();
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
