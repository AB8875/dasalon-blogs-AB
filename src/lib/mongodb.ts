import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function getDb(uri?: string, dbName = "test"): Promise<Db> {
  if (db) return db;

  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MongoDB URI is required");

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  return db;
}
