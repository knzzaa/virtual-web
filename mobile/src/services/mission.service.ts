import { api } from "./api";
import type {
  MissionAnswerInput,
  MissionAnswerResponse,
  MissionCompletionHistoryItem,
  MissionNextResponse,
} from "../types/dtos";

export const missionService = {
  next: () => api.get<MissionNextResponse>("/api/missions/next"),
  answer: (slug: string, payload: MissionAnswerInput) =>
    api.post<MissionAnswerResponse>(`/api/missions/${slug}/answer`, payload),
  history: () => api.get<MissionCompletionHistoryItem[]>("/api/missions/completions"),
};