import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "app";
  if (!uri) {
    console.error(
      "[v0] Missing MONGODB_URI. Add it in the Vars sidebar and re-run."
    );
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const now = new Date().toISOString();

  const categories = [
    { name: "General", slug: "general", createdAt: now, updatedAt: now },
    { name: "Tech", slug: "tech", createdAt: now, updatedAt: now },
  ];
  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      createdAt: now,
    },
    {
      name: "Editor User",
      email: "editor@example.com",
      role: "editor",
      createdAt: now,
    },
  ];
  const posts = [
    {
      title: "Welcome to Mongo",
      slug: "welcome-to-mongo",
      status: "published",
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Draft Example",
      slug: "draft-example",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const [catRes, userRes, postRes] = await Promise.all([
    db.collection("categories").insertMany(categories),
    db.collection("users").insertMany(users),
    db.collection("posts").insertMany(posts),
  ]);

  console.log("[v0] Seeded", {
    categories: catRes.insertedCount,
    users: userRes.insertedCount,
    posts: postRes.insertedCount,
  });

  await client.close();
}

main().catch((e) => {
  console.error("[v0] Seed failed:", e);
});
