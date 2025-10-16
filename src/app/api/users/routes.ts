import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const users = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 }) // <-- rename here
      .toArray();

    // map _id to string and createdAt field
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.created_at, // keep frontend consistent
    }));

    return NextResponse.json(formattedUsers);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, role } = await req.json();
    const db = await getDb();

    const newUser = {
      full_name,
      email,
      role,
      created_at: new Date().toISOString(),
    };

    const result = await db.collection("users").insertOne(newUser);
    return NextResponse.json({ ...newUser, _id: result.insertedId.toString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
