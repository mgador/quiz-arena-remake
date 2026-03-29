"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus, GripVertical, Plus, Save, Shuffle, Timer, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { QuizPayload, QuizQuestionInput } from "@/types/quiz";

function createOption(label = "") {
  return {
    id: crypto.randomUUID(),
    label,
  };
}

function createQuestion(type: QuizQuestionInput["type"] = "single_choice"): QuizQuestionInput {
  if (type === "true_false") {
    return {
      id: crypto.randomUUID(),
      type,
      prompt: "",
      options: [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ],
      correctOptionIds: ["true"],
      points: 100,
    };
  }

  return {
    id: crypto.randomUUID(),
    type,
    prompt: "",
    options: [createOption(), createOption()],
    correctOptionIds: [],
    points: 100,
  };
}

function createDraftQuiz(): QuizPayload {
  return {
    title: "",
    description: "",
    category: "",
    tags: [],
    visibility: "draft",
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      timeLimitPerQuiz: null,
      passingScore: null,
    },
    questions: [createQuestion()],
  };
}

export function QuizEditor({
  quizId,
  initialQuiz,
}: {
  quizId?: string;
  initialQuiz?: QuizPayload;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [quiz, setQuiz] = useState<QuizPayload>(initialQuiz ?? createDraftQuiz());
  const [tagInput, setTagInput] = useState("");

  const totalPoints = useMemo(
    () => quiz.questions.reduce((sum, question) => sum + question.points, 0),
    [quiz.questions]
  );

  const saveQuiz = () => {
    startTransition(async () => {
      const response = await fetch(quizId ? `/api/quizzes/${quizId}` : "/api/quizzes", {
        method: quizId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const payload = await response.json();

      if (!response.ok) {
        toast.error(payload.error || "Could not save quiz.");
        return;
      }

      toast.success(quizId ? "Quiz updated." : "Quiz created.");
      router.push(`/dashboard/quizzes/${payload.id}`);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="font-[family:var(--font-space-grotesk)] text-2xl text-white">
              Quiz setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={quiz.title}
                onChange={(event) =>
                  setQuiz((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Friday Trivia Clash"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quiz.description}
                onChange={(event) =>
                  setQuiz((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="A fast, competitive quiz with score and speed leaderboards."
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={quiz.category}
                  onChange={(event) =>
                    setQuiz((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Pop Culture"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  value={quiz.visibility}
                  onChange={(event) =>
                    setQuiz((current) => ({
                      ...current,
                      visibility: event.target.value as QuizPayload["visibility"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="science"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    const normalized = tagInput.trim().toLowerCase();
                    if (!normalized || quiz.tags.includes(normalized)) return;
                    setQuiz((current) => ({
                      ...current,
                      tags: [...current.tags, normalized].slice(0, 6),
                    }));
                    setTagInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="cursor-pointer rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200"
                    onClick={() =>
                      setQuiz((current) => ({
                        ...current,
                        tags: current.tags.filter((item) => item !== tag),
                      }))
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family:var(--font-space-grotesk)] text-2xl text-white">
              Questions
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {[
                ["single_choice", "Single choice"],
                ["true_false", "True / false"],
                ["multi_select", "Multi-select"],
              ].map(([type, label]) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() =>
                    setQuiz((current) => ({
                      ...current,
                      questions: [
                        ...current.questions,
                        createQuestion(type as QuizQuestionInput["type"]),
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {quiz.questions.map((question, index) => (
              <motion.div
                key={question.id}
                layout
                className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                        Question {index + 1}
                      </p>
                      <p className="text-sm text-slate-200">
                        {question.type.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() =>
                        setQuiz((current) => ({
                          ...current,
                          questions: current.questions.flatMap((item) =>
                            item.id === question.id
                              ? [{ ...item, id: crypto.randomUUID() }, item]
                              : [item]
                          ),
                        }))
                      }
                    >
                      <CopyPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() =>
                        setQuiz((current) => ({
                          ...current,
                          questions: current.questions.filter((item) => item.id !== question.id),
                        }))
                      }
                      disabled={quiz.questions.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <Textarea
                    value={question.prompt}
                    onChange={(event) =>
                      setQuiz((current) => ({
                        ...current,
                        questions: current.questions.map((item) =>
                          item.id === question.id ? { ...item, prompt: event.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Write the question prompt"
                  />
                  <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                    <div className="space-y-3">
                      {question.type === "true_false" ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                            >
                              <input
                                type="radio"
                                checked={question.correctOptionIds[0] === option.id}
                                onChange={() =>
                                  setQuiz((current) => ({
                                    ...current,
                                    questions: current.questions.map((item) =>
                                      item.id === question.id
                                        ? { ...item, correctOptionIds: [option.id] }
                                        : item
                                    ),
                                  }))
                                }
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        question.options.map((option) => {
                          const multi = question.type === "multi_select";
                          const checked = question.correctOptionIds.includes(option.id);
                          return (
                            <div
                              key={option.id}
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                            >
                              <input
                                type={multi ? "checkbox" : "radio"}
                                checked={checked}
                                onChange={() =>
                                  setQuiz((current) => ({
                                    ...current,
                                    questions: current.questions.map((item) => {
                                      if (item.id !== question.id) return item;

                                      return {
                                        ...item,
                                        correctOptionIds: multi
                                          ? checked
                                            ? item.correctOptionIds.filter((id) => id !== option.id)
                                            : [...item.correctOptionIds, option.id]
                                          : [option.id],
                                      };
                                    }),
                                  }))
                                }
                              />
                              <Input
                                value={option.label}
                                onChange={(event) =>
                                  setQuiz((current) => ({
                                    ...current,
                                    questions: current.questions.map((item) =>
                                      item.id === question.id
                                        ? {
                                            ...item,
                                            options: item.options.map((entry) =>
                                              entry.id === option.id
                                                ? { ...entry, label: event.target.value }
                                                : entry
                                            ),
                                          }
                                        : item
                                    ),
                                  }))
                                }
                                placeholder="Option label"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="rounded-full text-slate-200 hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                  setQuiz((current) => ({
                                    ...current,
                                    questions: current.questions.map((item) =>
                                      item.id === question.id
                                        ? {
                                            ...item,
                                            options: item.options.filter(
                                              (entry) => entry.id !== option.id
                                            ),
                                            correctOptionIds: item.correctOptionIds.filter(
                                              (id) => id !== option.id
                                            ),
                                          }
                                        : item
                                    ),
                                  }))
                                }
                                disabled={question.options.length <= 2}
                              >
                                Remove
                              </Button>
                            </div>
                          );
                        })
                      )}
                      {question.type !== "true_false" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                          onClick={() =>
                            setQuiz((current) => ({
                              ...current,
                              questions: current.questions.map((item) =>
                                item.id === question.id
                                  ? { ...item, options: [...item.options, createOption()] }
                                  : item
                              ),
                            }))
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Add option
                        </Button>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={50}
                        step={50}
                        value={question.points}
                        onChange={(event) =>
                          setQuiz((current) => ({
                            ...current,
                            questions: current.questions.map((item) =>
                              item.id === question.id
                                ? { ...item, points: Number(event.target.value) || 100 }
                                : item
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="font-[family:var(--font-space-grotesk)] text-2xl text-white">
              Game settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              Shuffle questions
              <input
                type="checkbox"
                checked={quiz.settings.shuffleQuestions}
                onChange={(event) =>
                  setQuiz((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      shuffleQuestions: event.target.checked,
                    },
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
              Shuffle options
              <input
                type="checkbox"
                checked={quiz.settings.shuffleOptions}
                onChange={(event) =>
                  setQuiz((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      shuffleOptions: event.target.checked,
                    },
                  }))
                }
              />
            </label>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-300" />
                Time limit in minutes
              </Label>
              <Input
                type="number"
                min={0}
                value={quiz.settings.timeLimitPerQuiz ?? ""}
                onChange={(event) =>
                  setQuiz((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      timeLimitPerQuiz: event.target.value
                        ? Number(event.target.value)
                        : null,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2">
                <Trophy className="h-4 w-4 text-cyan-300" />
                Passing score percentage
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={quiz.settings.passingScore ?? ""}
                onChange={(event) =>
                  setQuiz((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      passingScore: event.target.value
                        ? Number(event.target.value)
                        : null,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader>
            <CardTitle className="font-[family:var(--font-space-grotesk)] text-2xl text-white">
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-white/5">
                <TabsTrigger value="summary" className="rounded-full">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="flow" className="rounded-full">
                  Play flow
                </TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    {quiz.category || "Category"}
                  </p>
                  <h3 className="mt-3 font-[family:var(--font-space-grotesk)] text-2xl font-semibold text-white">
                    {quiz.title || "Untitled quiz"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {quiz.description || "Describe what makes this challenge worth playing."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quiz.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="rounded-full bg-cyan-300/20 text-cyan-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="flow" className="mt-4 space-y-4">
                {quiz.questions.slice(0, 3).map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5"
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      Round {index + 1}
                    </p>
                    <p className="mt-3 text-white">
                      {question.prompt || "Prompt preview appears here."}
                    </p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
            <Separator className="my-5 bg-white/10" />
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-cyan-300" />
                  Question count
                </span>
                <strong className="text-white">{quiz.questions.length}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span>Total possible score</span>
                <strong className="text-white">{totalPoints}</strong>
              </div>
            </div>
            <Button
              type="button"
              className="mt-6 w-full rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200"
              disabled={pending}
              onClick={saveQuiz}
            >
              <Save className="h-4 w-4" />
              {pending ? "Saving..." : "Save quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
