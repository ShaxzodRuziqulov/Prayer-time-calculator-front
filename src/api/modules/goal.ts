import { http } from "../http";
import type { Goal } from "../../types";

export interface CreateGoalPayload {
  goalType: string;
  targetCount: number;
}

export function createGoal(payload: CreateGoalPayload) {
  return http.post<Goal>("/api/goals", payload);
}

export function incrementGoal(goalId: string | number, value: number) {
  return http.put<Goal>(`/api/goals/${goalId}/increment?value=${value}`);
}
