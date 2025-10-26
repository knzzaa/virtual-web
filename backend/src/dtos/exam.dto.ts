import { z } from "zod";
import { QuestionType } from "../types/enums";

// Validation schemas
export const examSubmitSchema = z.object({
  answers: z.record(z.string(), z.string()), // { "1": "have known", "2": "1" }
});

export type ExamSubmitInput = z.infer<typeof examSubmitSchema>;

// Response types
export interface ExamListItem {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
}

export interface ExamQuestionResponse {
  id: number;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  options?: string[]; // Only for radio type
}

export interface ExamDetailResponse {
  exam: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    htmlContent: string | null;
  };
  questions: ExamQuestionResponse[];
}

export interface ExamResultItem {
  questionNumber: number;
  isCorrect: boolean;
  correctAnswer?: string; // For text type
  correctOptionIndex?: number; // For radio type
}

export interface ExamSubmitResponse {
  submissionId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: ExamResultItem[];
}

export interface ExamSubmissionHistoryItem {
  id: number;
  score: number;
  totalQuestions: number;
  submittedAt: Date;
}
