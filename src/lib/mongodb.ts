import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "quiz-arena";

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, { appName: "quiz-arena" });

export const clientPromise =
  global._mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = clientPromise;
}

export async function getMongoDatabase() {
  const resolvedClient = await clientPromise;
  return resolvedClient.db(dbName);
}
