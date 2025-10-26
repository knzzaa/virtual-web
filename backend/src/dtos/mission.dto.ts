import { z } from "zod";

// Validation schemas
export const missionAnswerSchema = z.object({
  questionNumber: z.number().int().positive(),
  selectedOptionIndex: z.number().int().min(0),
});

export type MissionAnswerInput = z.infer<typeof missionAnswerSchema>;

// Response types
export interface MissionQuestionResponse {
  questionNumber: number;
  questionText: string;
  options: string[];
}

export interface MissionNextResponse {
  mission: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    totalQuestions: number;
  } | null;
  currentQuestion?: MissionQuestionResponse;
  progress?: {
    currentQuestionNumber: number;
    questionsAnswered: number;
    currentScore: number;
  };
  message?: string; // "All missions completed!"
}

export interface MissionCompletionHistoryItem {
  id: number;
  missionId: number;
  missionSlug: string;
  missionTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface MissionAnswerResponse {
  isCorrect: boolean;
  correctOptionIndex: number;
  currentScore: number;
  nextQuestion?: MissionQuestionResponse;
  completed?: boolean;
  finalScore?: number;
  totalQuestions?: number;
  percentage?: number;
  completionId?: number;
}
