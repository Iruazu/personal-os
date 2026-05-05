const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Workout ──────────────────────────────────────────────────────────────
export interface ExerciseIn {
  name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface SessionIn {
  date: string;
  note?: string;
  exercises: ExerciseIn[];
}

export interface ExerciseOut extends ExerciseIn {
  id: number;
}

export interface SessionOut {
  id: number;
  date: string;
  note?: string;
  exercises: ExerciseOut[];
}

export interface VolumePoint {
  date: string;
  total_volume: number;
  exercise_name: string;
}

export const workoutApi = {
  createSession: (body: SessionIn) =>
    request<SessionOut>("/workout/sessions", { method: "POST", body: JSON.stringify(body) }),
  listSessions: (limit = 50) =>
    request<SessionOut[]>(`/workout/sessions?limit=${limit}`),
  deleteSession: (id: number) =>
    fetch(`${BASE}/workout/sessions/${id}`, { method: "DELETE" }),
  getVolume: (name: string, limit = 30) =>
    request<VolumePoint[]>(`/workout/volume?exercise_name=${encodeURIComponent(name)}&limit=${limit}`),
  listExerciseNames: () =>
    request<string[]>("/workout/exercises/names"),
};

// ── InBody ────────────────────────────────────────────────────────────────
export interface InBodyOut {
  id: number;
  measured_at: string;
  weight_kg?: number;
  muscle_kg?: number;
  fat_kg?: number;
  fat_percent?: number;
  bmi?: number;
  visceral_fat_level?: number;
  raw_ocr_text?: string;
}

export const inBodyApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<InBodyOut>("/inbody/upload", {
      method: "POST",
      body: form,
      headers: {},
    });
  },
  listRecords: (limit = 50) =>
    request<InBodyOut[]>(`/inbody/records?limit=${limit}`),
  patchRecord: (id: number, body: Partial<InBodyOut>) =>
    request<InBodyOut>(`/inbody/records/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};

// ── Nutrition ─────────────────────────────────────────────────────────────
export interface NutritionIn {
  meal_description: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface NutritionOut extends NutritionIn {
  id: number;
  logged_at: string;
  llm_feedback?: string;
}

export const nutritionApi = {
  createLog: (body: NutritionIn) =>
    request<NutritionOut>("/nutrition/logs", { method: "POST", body: JSON.stringify(body) }),
  listLogs: (limit = 50) =>
    request<NutritionOut[]>(`/nutrition/logs?limit=${limit}`),
  deleteLog: (id: number) =>
    fetch(`${BASE}/nutrition/logs/${id}`, { method: "DELETE" }),
};

// ── English ───────────────────────────────────────────────────────────────
export type ActivityType = "speak" | "reading" | "listening" | "writing";

export interface EnglishIn {
  activity_type: ActivityType;
  duration_minutes: number;
  score?: number;
  note?: string;
}

export interface EnglishOut extends EnglishIn {
  id: number;
  logged_at: string;
}

export interface WeeklyStats {
  week: string;
  total_minutes: number;
  activity_type: string;
}

export interface ActivityBreakdown {
  activity_type: string;
  total_minutes: number;
}

export const englishApi = {
  createLog: (body: EnglishIn) =>
    request<EnglishOut>("/english/logs", { method: "POST", body: JSON.stringify(body) }),
  listLogs: (limit = 50) =>
    request<EnglishOut[]>(`/english/logs?limit=${limit}`),
  deleteLog: (id: number) =>
    fetch(`${BASE}/english/logs/${id}`, { method: "DELETE" }),
  weeklyStats: () =>
    request<WeeklyStats[]>("/english/weekly"),
  breakdown: () =>
    request<ActivityBreakdown[]>("/english/breakdown"),
};
