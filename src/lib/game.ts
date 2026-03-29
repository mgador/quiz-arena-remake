import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { trackEvent } from "@/lib/analytics";
import { scoreQuizAttempt } from "@/lib/quiz";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt } from "@/models/QuizAttempt";
import type { AttemptAnswerInput, QuizPayload } from "@/types/quiz";

export async function getQuizBySlug(slug: string) {
  await connectToDatabase();
  return Quiz.findOne({ slug }).lean();
}

export async function ensureAttempt({
  quizId,
  userId,
}: {
  quizId: string;
  userId: string;
}) {
  await connectToDatabase();

  const existingAttempt = await QuizAttempt.findOne({
    quizId: new Types.ObjectId(quizId),
    userId: new Types.ObjectId(userId),
    status: "in_progress",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (existingAttempt) {
    return existingAttempt;
  }

  const quiz = await Quiz.findById(quizId).lean();

  if (!quiz) {
    return null;
  }

  const attempt = await QuizAttempt.create({
    quizId,
    userId,
    status: "in_progress",
    startedAt: new Date(),
    maxScore: quiz.questions.reduce(
      (sum: number, question: QuizPayload["questions"][number]) => sum + question.points,
      0
    ),
    questionSnapshot: quiz.questions,
  });

  await Quiz.findByIdAndUpdate(quizId, { $inc: { playCount: 1 } });
  trackEvent("quiz.attempt_started", { quizId, userId });

  return attempt.toObject();
}

export async function submitAttempt({
  attemptId,
  userId,
  answers,
}: {
  attemptId: string;
  userId: string;
  answers: AttemptAnswerInput[];
}) {
  await connectToDatabase();

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    userId,
  });

  if (!attempt) {
    throw new Error("Attempt not found.");
  }

  if (attempt.status === "submitted") {
    throw new Error("Attempt already submitted.");
  }

  const { score, gradedAnswers } = scoreQuizAttempt(attempt.questionSnapshot, answers);
  const completionMs = Date.now() - new Date(attempt.startedAt).getTime();

  attempt.answers = gradedAnswers;
  attempt.score = score;
  attempt.completionMs = completionMs;
  attempt.submittedAt = new Date();
  attempt.status = "submitted";
  await attempt.save();

  trackEvent("quiz.attempt_submitted", {
    quizId: attempt.quizId.toString(),
    userId,
    score,
    completionMs,
  });

  return attempt;
}
