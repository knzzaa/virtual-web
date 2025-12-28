import { api } from "./api";
import type {
  ExamDetailResponse,
  ExamListItem,
  ExamSubmitInput,
  ExamSubmitResponse,
  ExamSubmissionHistoryItem,
} from "../types/dtos";

export const examService = {
  list: () => api.get<ExamListItem[]>("/api/exams"),
  detail: (slug: string) => api.get<ExamDetailResponse>(`/api/exams/${slug}`),
  submit: (slug: string, payload: ExamSubmitInput) =>
    api.post<ExamSubmitResponse>(`/api/exams/${slug}/submit`, payload),
  history: (slug: string) =>
    api.get<ExamSubmissionHistoryItem[]>(`/api/exams/${slug}/submissions`),
};