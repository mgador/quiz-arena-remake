import { Schema, model, models } from "mongoose";

const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const questionSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["single_choice", "true_false", "multi_select"],
      required: true,
    },
    prompt: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    correctOptionIds: { type: [String], default: [] },
    points: { type: Number, required: true },
  },
  { _id: false }
);

const answerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedOptionIds: { type: [String], default: [] },
    isCorrect: { type: Boolean, default: false },
    pointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    completionMs: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    questionSnapshot: { type: [questionSnapshotSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

quizAttemptSchema.index({ quizId: 1, score: -1, completionMs: 1, submittedAt: 1 });

export const QuizAttempt =
  models.QuizAttempt || model("QuizAttempt", quizAttemptSchema);
