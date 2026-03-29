import { Types } from "mongoose";
import { z } from "zod";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt } from "@/models/QuizAttempt";
import type {
  AttemptAnswerInput,
  LeaderboardEntry,
  QuizPayload,
} from "@/types/quiz";
import { slugify } from "@/lib/slugs";

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(120),
});

const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["single_choice", "true_false", "multi_select"]),
  prompt: z.string().trim().min(5).max(240),
  options: z.array(optionSchema),
  correctOptionIds: z.array(z.string().min(1)).min(1),
  points: z.number().int().min(50).max(500),
});

export const quizPayloadSchema = z.object({
  title: z.string().trim().min(4).max(80),
  description: z.string().trim().min(12).max(600),
  category: z.string().trim().min(2).max(48),
  tags: z.array(z.string().trim().min(2).max(24)).max(6),
  visibility: z.enum(["draft", "public", "private"]),
  settings: z.object({
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    timeLimitPerQuiz: z.number().int().positive().nullable().optional(),
    passingScore: z.number().int().min(0).max(100).nullable().optional(),
  }),
  questions: z.array(questionSchema).min(1).max(20),
});

export function normalizeQuizPayload(input: QuizPayload) {
  const parsed = quizPayloadSchema.parse(input);

  const questions = parsed.questions.map((question) => {
    if (question.type === "true_false") {
      return {
        ...question,
        options: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctOptionIds: [question.correctOptionIds[0] === "false" ? "false" : "true"],
      };
    }

    const validOptionIds = new Set(question.options.map((option) => option.id));

    return {
      ...question,
      options: question.options.filter((option) => option.label.trim().length > 0),
      correctOptionIds: question.correctOptionIds.filter((id) => validOptionIds.has(id)),
    };
  });

  return {
    ...parsed,
    tags: parsed.tags.map((tag) => tag.toLowerCase()),
    questions,
  };
}

export async function createUniqueSlug(title: string, currentQuizId?: string) {
  const base = slugify(title) || "quiz";
  let candidate = base;
  let iteration = 1;

  while (true) {
    const existing = await Quiz.findOne({ slug: candidate }).select("_id").lean();

    if (!existing || existing._id.toString() === currentQuizId) {
      return candidate;
    }

    iteration += 1;
    candidate = `${base}-${iteration}`;
  }
}

export function scoreQuizAttempt(
  questions: Array<{
    id: string;
    correctOptionIds: string[];
    points: number;
  }>,
  answers: AttemptAnswerInput[]
) {
  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId,
      [...answer.selectedOptionIds].sort().join("|"),
    ])
  );

  let score = 0;
  const gradedAnswers = questions.map((question) => {
    const expected = [...question.correctOptionIds].sort().join("|");
    const actual = answerMap.get(question.id) ?? "";
    const isCorrect = expected === actual;
    const pointsEarned = isCorrect ? question.points : 0;
    score += pointsEarned;

    return {
      questionId: question.id,
      selectedOptionIds:
        answers.find((answer) => answer.questionId === question.id)?.selectedOptionIds ?? [],
      isCorrect,
      pointsEarned,
    };
  });

  return { score, gradedAnswers };
}

export async function getLeaderboard(
  quizId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const attempts = await QuizAttempt.find({
    quizId: new Types.ObjectId(quizId),
    status: "submitted",
  })
    .sort({ score: -1, completionMs: 1, submittedAt: 1 })
    .limit(limit)
    .populate("userId", "name")
    .lean();

  return attempts.map((attempt, index) => ({
    attemptId: attempt._id.toString(),
    playerId: attempt.userId._id.toString(),
    playerName: attempt.userId.name,
    score: attempt.score,
    maxScore: attempt.maxScore,
    completionMs: attempt.completionMs,
    submittedAt: attempt.submittedAt?.toISOString?.() ?? new Date().toISOString(),
    rank: index + 1,
  }));
}

export async function getAttemptRank(quizId: string, attemptId: string) {
  const rankedAttempts = await QuizAttempt.find({
    quizId: new Types.ObjectId(quizId),
    status: "submitted",
  })
    .sort({ score: -1, completionMs: 1, submittedAt: 1 })
    .select("_id")
    .lean();

  const rank =
    rankedAttempts.findIndex((attempt) => attempt._id.toString() === attemptId) + 1;

  return rank || null;
}
