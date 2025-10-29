import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { Db } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = (await getDb()) as Db;

    const [totalPosts, totalCategories, totalUsers, posts] = await Promise.all([
      db.collection("posts").countDocuments(),
      db.collection("categories").countDocuments(),
      db.collection("users").countDocuments(),
      db
        .collection("posts")
        .find({}, { projection: { views: 1 } })
        .toArray(),
    ]);

    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    return NextResponse.json({
      totalPosts,
      totalCategories,
      totalUsers,
      totalViews,
    });
  } catch (err: any) {
    // Handle MongoDB connection errors gracefully
    if (
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("MongoDB")
    ) {
      console.warn("MongoDB connection failed, returning mock data");
      return NextResponse.json({
        totalPosts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalViews: 0,
        message: "MongoDB not available - showing mock data",
      });
    }

    return NextResponse.json(
      { error: err.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
