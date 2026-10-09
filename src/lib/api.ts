const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function personalIdHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem("fitschedule.personalSession");
  if (!raw) return {};
  try {
    const session = JSON.parse(raw) as { id?: string };
    return session.id ? { "X-Personal-Id": session.id } : {};
  } catch {
    return {};
  }
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  Object.entries(personalIdHeader()).forEach(([key, value]) => headers.set(key, value));

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    let message = "Erro inesperado";
    try {
      const payload = await res.json();
      message = payload.message ?? message;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type Student = {
  id: string;
  name: string;
  whatsapp: string;
  birthDate: string | null;
};

export type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  student: {
    id: string;
    name: string;
    whatsapp: string;
  };
};

export type DashboardStats = {
  students: number;
  futureAppointments: number;
  upcoming: Appointment[];
};

export type PersonalTrainer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  canManageStudents: boolean;
  canManageAppointments: boolean;
  admin: boolean;
  active: boolean;
};

export type PersonalTrainerPayload = Omit<PersonalTrainer, "id"> & {
  password?: string;
};

export type PersonalSession = {
  id: string;
  name: string;
  email: string;
  canManageStudents: boolean;
  canManageAppointments: boolean;
  admin: boolean;
};

export const api = {
  dashboard: () => apiRequest<DashboardStats>("/api/dashboard"),
  listPersonalTrainers: () => apiRequest<PersonalTrainer[]>("/api/personais"),
  login: (body: { email: string; password: string }) =>
    apiRequest<PersonalSession>("/api/auth/login", { method: "POST", body }),
  createPersonalTrainer: (body: PersonalTrainerPayload) =>
    apiRequest<PersonalTrainer>("/api/personais", { method: "POST", body }),
  updatePersonalTrainer: (id: string, body: PersonalTrainerPayload) =>
    apiRequest<PersonalTrainer>(`/api/personais/${id}`, { method: "PUT", body }),
  deletePersonalTrainer: (id: string) => apiRequest<void>(`/api/personais/${id}`, { method: "DELETE" }),
  listStudents: () => apiRequest<Student[]>("/api/alunos"),
  createStudent: (body: Omit<Student, "id">) => apiRequest<Student>("/api/alunos", { method: "POST", body }),
  updateStudent: (id: string, body: Omit<Student, "id">) =>
    apiRequest<Student>(`/api/alunos/${id}`, { method: "PUT", body }),
  deleteStudent: (id: string) => apiRequest<void>(`/api/alunos/${id}`, { method: "DELETE" }),
  listFutureAppointments: () => apiRequest<Appointment[]>("/api/agendamentos/futuros"),
  listAppointmentsByYear: (year: number) => apiRequest<Appointment[]>(`/api/agendamentos?year=${year}`),
  createAppointment: (body: { studentId: string; scheduledAt: string }) =>
    apiRequest<Appointment>("/api/agendamentos", { method: "POST", body }),
  deleteAppointment: (id: string) => apiRequest<void>(`/api/agendamentos/${id}`, { method: "DELETE" }),
  getWebhookUrl: () => apiRequest<{ webhookUrl: string }>("/api/configuracoes/webhook"),
  setWebhookUrl: (webhookUrl: string) =>
    apiRequest<{ webhookUrl: string }>("/api/configuracoes/webhook", { method: "PUT", body: { webhookUrl } }),
  testWebhook: () => apiRequest<{ sent: boolean; reason?: string }>("/api/configuracoes/webhook/teste", { method: "POST" }),
};

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
