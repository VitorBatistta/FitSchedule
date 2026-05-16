import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Users, Clock, Phone, TrendingUp } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitSchedule — Agenda inteligente para personal trainers" },
      { name: "description", content: "Gerencie alunos e agende aulas com validação automática de conflitos e integração WhatsApp via n8n." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.dashboard,
  });

  return (
    <AppShell>
      <section className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold">
          Bom treino. <span className="text-primary">Sem conflitos.</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Acompanhe suas próximas aulas, gerencie alunos e dispare lembretes automáticos via n8n.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="lg" className="shadow-[var(--shadow-glow)]">
            <Link to="/agendar"><CalendarPlus className="mr-2 h-4 w-4" />Novo agendamento</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/alunos"><Users className="mr-2 h-4 w-4" />Gerenciar alunos</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard icon={<Users className="h-5 w-5" />} label="Alunos cadastrados" value={stats?.students ?? "—"} />
        <StatCard icon={<CalendarPlus className="h-5 w-5" />} label="Aulas futuras" value={stats?.futureAppointments ?? "—"} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Próximas 24h"
          value={(stats?.upcoming ?? []).filter((a) => isToday(new Date(a.scheduledAt)) || isTomorrow(new Date(a.scheduledAt))).length} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Próximas aulas</h2>
          <Badge variant="secondary" className="rounded-full">{stats?.upcoming?.length ?? 0}</Badge>
        </div>

        {!stats?.upcoming?.length ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p>Nenhuma aula agendada ainda.</p>
              <Button asChild className="mt-4">
                <Link to="/agendar">Criar primeiro agendamento</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {stats.upcoming.map((a) => {
              const date = new Date(a.scheduledAt);
              const label = isToday(date) ? "Hoje" : isTomorrow(date) ? "Amanhã" : format(date, "EEE, dd MMM", { locale: ptBR });
              return (
                <Card key={a.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0 grid place-items-center h-14 w-14 rounded-xl bg-primary/15 text-primary">
                      <div className="text-center">
                        <div className="text-[10px] uppercase tracking-wider">{label.split(",")[0]}</div>
                        <div className="font-display font-bold text-lg">{format(date, "HH:mm")}</div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{a.student?.name ?? "—"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {a.student?.whatsapp ?? ""}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right text-sm text-muted-foreground">
                      {format(date, "dd/MM/yyyy")}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/15 text-primary">{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
