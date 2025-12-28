import { QuestionType } from "./enums";

// ---- Auth
export type RegisterInput = { email: string; password: string; name: string };
export type LoginInput = { email: string; password: string };

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export type MeResponse = {
  user: { userId: number; email: string; name: string };
};

// ---- Materials
export type MaterialListItem = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isLikedByUser: boolean;
};

export type MaterialDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  contentHtml: string;
  isLikedByUser: boolean;
};

export type MaterialLikeResponse = { liked: boolean };

// ---- Missions
export type MissionNextResponse =
  | {
      mission: {
        id: number;
        slug: string;
        title: string;
        description: string | null;
        totalQuestions: number;
      };
      currentQuestion: {
        questionNumber: number;
        questionText: string;
        options: string[];
      };
      progress: {
        currentQuestionNumber: number;
        questionsAnswered: number;
        currentScore: number;
      };
    }
  | { mission: null; message: string };

export type MissionAnswerInput = {
  questionNumber: number;
  selectedOptionIndex: number;
};

export type MissionAnswerResponse = {
  isCorrect: boolean;
  correctOptionIndex: number;
  currentScore: number;
  nextQuestion?: {
    questionNumber: number;
    questionText: string;
    options: string[];
  };
  completed?: boolean;
  finalScore?: number;
  totalQuestions?: number;
  percentage?: number;
  completionId?: number;
};

export type MissionCompletionHistoryItem = {
  id: number;
  missionId: number;
  missionSlug: string;
  missionTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
};

// ---- Exams
export type ExamListItem = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
};

export type ExamQuestionResponse = {
  id: number;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  options?: string[];
};

export type ExamDetailResponse = {
  exam: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    htmlContent: string | null;
  };
  questions: ExamQuestionResponse[];
};

export type ExamSubmitInput = { answers: Record<string, string> };

export type ExamResultItem = {
  questionNumber: number;
  isCorrect: boolean;
  correctAnswer?: string;
  correctOptionIndex?: number;
};

export type ExamSubmitResponse = {
  submissionId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: ExamResultItem[];
};

export type ExamSubmissionHistoryItem = {
  id: number;
  score: number;
  totalQuestions: number;
  submittedAt: string;
};