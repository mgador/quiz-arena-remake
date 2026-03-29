import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
    createdQuizzesCount: { type: Number, default: 0 },
    playedQuizzesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const User = models.User || model("User", userSchema);
