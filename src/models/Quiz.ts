import { Schema, model, models, Types } from "mongoose";

const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true, default: () => new Types.ObjectId().toHexString() },
    type: {
      type: String,
      enum: ["single_choice", "true_false", "multi_select"],
      required: true,
    },
    prompt: { type: String, required: true, trim: true },
    options: { type: [optionSchema], default: [] },
    correctOptionIds: { type: [String], default: [] },
    points: { type: Number, required: true, min: 1, default: 100 },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    visibility: {
      type: String,
      enum: ["draft", "public", "private"],
      default: "draft",
      index: true,
    },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      timeLimitPerQuiz: { type: Number, default: null },
      passingScore: { type: Number, default: null },
    },
    questions: { type: [questionSchema], default: [] },
    playCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Quiz = models.Quiz || model("Quiz", quizSchema);
