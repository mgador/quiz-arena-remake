export const questionTypes = [
  "single_choice",
  "true_false",
  "multi_select",
] as const;

export const quizVisibility = ["draft", "public", "private"] as const;

export type QuestionType = (typeof questionTypes)[number];
export type QuizVisibility = (typeof quizVisibility)[number];

export interface QuizOptionInput {
  id: string;
  label: string;
}

export interface QuizQuestionInput {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuizOptionInput[];
  correctOptionIds: string[];
  points: number;
}

export interface QuizSettingsInput {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  timeLimitPerQuiz?: number | null;
  passingScore?: number | null;
}

export interface QuizPayload {
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: QuizVisibility;
  settings: QuizSettingsInput;
  questions: QuizQuestionInput[];
}

export interface AttemptAnswerInput {
  questionId: string;
  selectedOptionIds: string[];
}

export interface LeaderboardEntry {
  attemptId: string;
  playerName: string;
  playerId: string;
  score: number;
  maxScore: number;
  completionMs: number;
  submittedAt: string;
  rank: number;
}
