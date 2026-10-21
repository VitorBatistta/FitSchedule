import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Users, CalendarPlus, Settings, LayoutDashboard, LogOut, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearPersonalSession, firstAllowedPath, getPersonalSession } from "@/lib/auth";
import type { PersonalSession } from "@/lib/api";

const nav = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/personais", label: "Personal", icon: UserCog },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/agendar", label: "Agendar", icon: CalendarPlus },
  { to: "/configuracoes", label: "Config", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [session, setSession] = useState<PersonalSession | null>(null);

  useEffect(() => {
    const current = getPersonalSession();
    setSession(current);

    if (!current && pathname !== "/login") {
      window.location.href = "/login";
      return;
    }

    if (current?.admin) {
      return;
    }

    if (current && !["/alunos", "/agendar"].includes(pathname)) {
      window.location.href = firstAllowedPath(current);
    }
  }, [pathname]);

  const visibleNav = useMemo(() => {
    if (!session) return [];
    if (session.admin) return nav;
    return [
      ...(session.canManageStudents ? [{ to: "/alunos", label: "Alunos", icon: Users }] : []),
      ...(session.canManageAppointments ? [{ to: "/agendar", label: "Agendar", icon: CalendarPlus }] : []),
    ];
  }, [session]);

  function logout() {
    clearPersonalSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">FitSchedule</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal Trainer</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            {session && (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Sair
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:pb-10">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md grid grid-cols-5">
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
          {session && (
            <button type="button" onClick={logout} className="flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground">
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
