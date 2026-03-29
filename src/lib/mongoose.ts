import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "quiz-arena";

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

declare global {
  var mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  if (!global.mongooseConnectionPromise) {
    global.mongooseConnectionPromise = mongoose.connect(uri!, {
      dbName,
      bufferCommands: false,
    });
  }

  return global.mongooseConnectionPromise;
}
