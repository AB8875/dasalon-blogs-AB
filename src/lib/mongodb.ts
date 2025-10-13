import { MongoClient, ServerApiVersion } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI env var. Add it in the Vars sidebar.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientPromise =
  global._mongoClientPromise ??
  client.connect().then(async (c) => {
    // Ping to confirm connectivity
    try {
      await c.db(process.env.MONGODB_DB || "app").command({ ping: 1 });
    } catch (e) {
      console.error("[v0] MongoDB ping failed:", e);
      throw e;
    }
    return c;
  });

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = clientPromise;
}

export async function getDb() {
  const c = await clientPromise;
  const dbName = process.env.MONGODB_DB || "app";
  return c.db(dbName);
}
