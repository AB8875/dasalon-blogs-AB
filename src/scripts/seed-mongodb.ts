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
    {
      name: "BEAUTY",
      slug: "beauty",
      subCategories: [
        "beauty tips",
        "hair",
        "facial",
        "skin",
        "grooming",
        "makeup",
        "nail",
      ],
      created_at: now,
      updated_at: now,
    },
    {
      name: "TRENDS",
      slug: "trends",
      subCategories: ["influencers", "beauty trends", "celebrities"],
      created_at: now,
      updated_at: now,
    },
    {
      name: "CAREER",
      slug: "career",
      subCategories: ["hiring talent", "career tips"],
      created_at: now,
      updated_at: now,
    },
    {
      name: "FEATURES",
      slug: "features",
      subCategories: ["interview stories"],
      created_at: now,
      updated_at: now,
    },
    {
      name: "PRODUCT",
      slug: "product",
      subCategories: ["product", "equipment"],
      created_at: now,
      updated_at: now,
    },
    {
      name: "LOCATION",
      slug: "location",
      subCategories: ["india", "singapore"],
      created_at: now,
      updated_at: now,
    },
  ];

  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      created_at: now,
    },
    {
      name: "Editor User",
      email: "editor@example.com",
      role: "editor",
      created_at: now,
    },
  ];

  const posts = [
    {
      title: "Welcome to Mongo",
      slug: "welcome-to-mongo",
      status: "published",
      created_at: now,
      updated_at: now,
    },
    {
      title: "Draft Example",
      slug: "draft-example",
      status: "draft",
      created_at: now,
      updated_at: now,
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
