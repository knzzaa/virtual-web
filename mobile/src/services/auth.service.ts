import { api } from "./api";
import type { AuthResponse, LoginInput, RegisterInput, MeResponse } from "../types/dtos";

export const authService = {
  register: (payload: RegisterInput) => api.post<AuthResponse>("/api/auth/register", payload),
  login: (payload: LoginInput) => api.post<AuthResponse>("/api/auth/login", payload),
  me: () => api.get<MeResponse>("/api/auth/me"),
  logout: () => api.post<{ message: string }>("/api/auth/logout"),
};