import { api } from "./api";
import type { MaterialDetail, MaterialLikeResponse, MaterialListItem } from "../types/dtos";

export const materialService = {
  list: () => api.get<MaterialListItem[]>("/api/materials"),
  detail: (slug: string) => api.get<MaterialDetail>(`/api/materials/${slug}`),
  toggleLike: (slug: string) => api.post<MaterialLikeResponse>(`/api/materials/${slug}/like`),
};