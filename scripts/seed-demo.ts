import { randomInt } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";

loadEnvConfig(process.cwd());

const AI_MARKER = "ai_seed_v1";
const AI_EMAIL_DOMAIN = "seed.local";

type SeedConfig = {
  users: number;
  quizzesPerUser: number;
  minQuestions: number;
  maxQuestions: number;
  minAttemptsPerUser: number;
  maxAttemptsPerUser: number;
  password: string;
  cleanupOnly: boolean;
};

function parseArgs(argv: string[]): SeedConfig {
  const getNumber = (flag: string, fallback: number) => {
    const index = argv.indexOf(flag);
    if (index === -1) return fallback;
    const value = Number(argv[index + 1]);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
  };

  const getString = (flag: string, fallback: string) => {
    const index = argv.indexOf(flag);
    if (index === -1) return fallback;
    return argv[index + 1] || fallback;
  };

  return {
    users: getNumber("--users", 25),
    quizzesPerUser: getNumber("--quizzes-per-user", 3),
    minQuestions: getNumber("--min-questions", 5),
    maxQuestions: getNumber("--max-questions", 10),
    minAttemptsPerUser: getNumber("--min-attempts-per-user", 3),
    maxAttemptsPerUser: getNumber("--max-attempts-per-user", 10),
    password: getString("--password", "SeedPass123!"),
    cleanupOnly: argv.includes("--cleanup"),
  };
}

function pickOne<T>(values: T[]): T {
  return values[randomInt(values.length)];
}

function pickManyDistinct<T>(values: T[], count: number): T[] {
  const copy = [...values];
  const out: T[] = [];

  while (copy.length > 0 && out.length < count) {
    const index = randomInt(copy.length);
    out.push(copy[index]);
    copy.splice(index, 1);
  }

  return out;
}

function buildQuestion(index: number) {
  const type = pickOne(["single_choice", "multi_select", "true_false"] as const);

  if (type === "true_false") {
    const answer = pickOne(["true", "false"]);
    return {
      id: `q_${index + 1}`,
      type,
      prompt: `AI generated true/false statement #${index + 1}.`,
      options: [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ],
      correctOptionIds: [answer],
      points: 100,
    };
  }

  const options = [
    { id: "a", label: "Option A" },
    { id: "b", label: "Option B" },
    { id: "c", label: "Option C" },
    { id: "d", label: "Option D" },
  ];

  return {
    id: `q_${index + 1}`,
    type,
    prompt: `AI generated question #${index + 1}.`,
    options,
    correctOptionIds:
      type === "single_choice"
        ? [pickOne(options).id]
        : pickManyDistinct(
            options.map((option) => option.id),
            2,
          ),
    points: 100,
  };
}

function buildQuizTitle(topic: string, index: number) {
  return `[AI SEED] ${topic} Quiz ${index + 1}`;
}

function uniqueSlug(baseTitle: string, runId: string, userIndex: number, quizIndex: number) {
  const base = baseTitle
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "ai-seed-quiz";
  return `${base}-${runId}-u${userIndex + 1}-q${quizIndex + 1}`;
}

async function cleanupSeedData() {
  const [{ Quiz }, { QuizAttempt }, { User }] = await Promise.all([
    import("../src/models/Quiz"),
    import("../src/models/QuizAttempt"),
    import("../src/models/User"),
  ]);

  const users = await User.find({ email: new RegExp(`^${AI_MARKER}\\.`) })
    .select("_id")
    .lean();
  const userIds = users.map((user) => user._id);

  const [attemptResult, quizResult, userResult] = await Promise.all([
    QuizAttempt.deleteMany({ userId: { $in: userIds } }),
    Quiz.deleteMany({
      $or: [{ ownerId: { $in: userIds } }, { tags: AI_MARKER }, { tags: "ai-seed" }],
    }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);

  console.log("Cleanup complete");
  console.log(`- attempts deleted: ${attemptResult.deletedCount ?? 0}`);
  console.log(`- quizzes deleted: ${quizResult.deletedCount ?? 0}`);
  console.log(`- users deleted: ${userResult.deletedCount ?? 0}`);
}

async function seedData(config: SeedConfig) {
  const [{ Quiz }, { QuizAttempt }, { User }] = await Promise.all([
    import("../src/models/Quiz"),
    import("../src/models/QuizAttempt"),
    import("../src/models/User"),
  ]);

  const runId = Date.now().toString(36);
  const passwordHash = await hash(config.password, 10);
  const topics = ["Science", "History", "Math", "Sports", "Music", "Movies", "Tech"];

  const usersToInsert = Array.from({ length: config.users }, (_, userIndex) => ({
    name: `AI Seed User ${runId.toUpperCase()}-${userIndex + 1}`,
    email: `${AI_MARKER}.${runId}.u${userIndex + 1}@${AI_EMAIL_DOMAIN}`,
    passwordHash,
    image: null,
    emailVerified: null,
    createdQuizzesCount: config.quizzesPerUser,
    playedQuizzesCount: 0,
  }));

  const insertedUsers = await User.insertMany(usersToInsert);

  const quizzesToInsert = insertedUsers.flatMap((user, userIndex) => {
    return Array.from({ length: config.quizzesPerUser }, (_, quizIndex) => {
      const topic = pickOne(topics);
      const title = buildQuizTitle(topic, quizIndex);
      const questionCount = randomInt(config.minQuestions, config.maxQuestions + 1);

      return {
        ownerId: user._id,
        title,
        slug: uniqueSlug(title, runId, userIndex, quizIndex),
        description:
          `This is AI-generated seed content (${AI_MARKER}) for testing and can be deleted safely.`,
        visibility: pickOne(["public", "draft"] as const),
        category: topic,
        tags: ["ai-seed", AI_MARKER, topic.toLowerCase()],
        settings: {
          shuffleQuestions: pickOne([true, false]),
          shuffleOptions: pickOne([true, false]),
          timeLimitPerQuiz: pickOne([300, 600, null]),
          passingScore: pickOne([60, 70, 80, null]),
        },
        questions: Array.from({ length: questionCount }, (_, questionIndex) =>
          buildQuestion(questionIndex),
        ),
        playCount: 0,
      };
    });
  });

  const insertedQuizzes = await Quiz.insertMany(quizzesToInsert);

  const quizPlayCountById = new Map<string, number>();

  const attemptsToInsert = insertedUsers.flatMap((user) => {
    const attemptsCount = randomInt(
      config.minAttemptsPerUser,
      config.maxAttemptsPerUser + 1,
    );

    return Array.from({ length: attemptsCount }, () => {
      const quiz = pickOne(insertedQuizzes);
      const completionMs = randomInt(45_000, 20 * 60_000);
      const submittedAt = new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000);
      const startedAt = new Date(submittedAt.getTime() - completionMs);

      const answers = quiz.questions.map((question: (typeof quiz.questions)[number]) => {
        const shouldAnswerCorrectly = randomInt(100) < 65;

        const selectedOptionIds = shouldAnswerCorrectly
          ? [...question.correctOptionIds]
          : question.type === "single_choice"
            ? [pickOne(question.options.map((option: { id: string }) => option.id))]
            : question.type === "true_false"
              ? [question.correctOptionIds[0] === "true" ? "false" : "true"]
              : pickManyDistinct(
                  question.options.map((option: { id: string }) => option.id),
                  randomInt(1, Math.min(3, question.options.length) + 1),
                );

        const expected = [...question.correctOptionIds].sort().join("|");
        const actual = [...selectedOptionIds].sort().join("|");
        const isCorrect = expected === actual;

        return {
          questionId: question.id,
          selectedOptionIds,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        };
      });

      const score = answers.reduce(
        (sum: number, answer: (typeof answers)[number]) => sum + answer.pointsEarned,
        0,
      );
      const maxScore = quiz.questions.reduce(
        (sum: number, question: (typeof quiz.questions)[number]) => sum + question.points,
        0,
      );

      const quizId = quiz._id.toString();
      quizPlayCountById.set(quizId, (quizPlayCountById.get(quizId) ?? 0) + 1);

      return {
        quizId: quiz._id,
        userId: user._id,
        status: "submitted",
        startedAt,
        submittedAt,
        completionMs,
        score,
        maxScore,
        answers,
        questionSnapshot: quiz.questions.map(
          (question: (typeof quiz.questions)[number]) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            options: question.options,
            correctOptionIds: question.correctOptionIds,
            points: question.points,
          }),
        ),
      };
    });
  });

  const insertedAttempts = await QuizAttempt.insertMany(attemptsToInsert);

  const quizPlayCountOps = Array.from(quizPlayCountById.entries()).map(([quizId, count]) => ({
    updateOne: {
      filter: { _id: quizId },
      update: { $inc: { playCount: count } },
    },
  }));

  if (quizPlayCountOps.length > 0) {
    await Quiz.bulkWrite(quizPlayCountOps);
  }

  const userPlayedCountOps = insertedUsers.map((user) => ({
    updateOne: {
      filter: { _id: user._id },
      update: {
        $set: {
          playedQuizzesCount: attemptsToInsert.filter(
            (attempt) => attempt.userId.toString() === user._id.toString(),
          ).length,
        },
      },
    },
  }));

  if (userPlayedCountOps.length > 0) {
    await User.bulkWrite(userPlayedCountOps);
  }

  console.log("Seed complete");
  console.log(`- users created: ${insertedUsers.length}`);
  console.log(`- quizzes created: ${insertedQuizzes.length}`);
  console.log(`- attempts created: ${insertedAttempts.length}`);
  console.log(`- marker: ${AI_MARKER}`);
  console.log(`- email pattern: ${AI_MARKER}.*@${AI_EMAIL_DOMAIN}`);
}

async function main() {
  const config = parseArgs(process.argv);

  const { connectToDatabase } = await import("../src/lib/mongoose");

  await connectToDatabase();

  if (config.cleanupOnly) {
    await cleanupSeedData();
    return;
  }

  if (config.minQuestions > config.maxQuestions) {
    throw new Error("--min-questions must be <= --max-questions");
  }

  if (config.minAttemptsPerUser > config.maxAttemptsPerUser) {
    throw new Error("--min-attempts-per-user must be <= --max-attempts-per-user");
  }

  await seedData(config);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
  });
