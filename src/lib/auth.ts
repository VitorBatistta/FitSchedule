import type { PersonalSession } from "@/lib/api";

const SESSION_KEY = "fitschedule.personalSession";

export function getPersonalSession(): PersonalSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersonalSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setPersonalSession(session: PersonalSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPersonalSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function firstAllowedPath(session: PersonalSession) {
  if (session.admin) return "/";
  if (session.canManageStudents) return "/alunos";
  if (session.canManageAppointments) return "/agendar";
  return "/login";
}
