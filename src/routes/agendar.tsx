import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { api, errorMessage, type Appointment } from "@/lib/api";

export const Route = createFileRoute("/agendar")({
  head: () => ({ meta: [{ title: "Agendar - FitSchedule" }] }),
  component: AgendarPage,
});

function AgendarPage() {
  const qc = useQueryClient();
  const [alunoId, setAlunoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [calendarWeek, setCalendarWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [saving, setSaving] = useState(false);

  const { data: alunos = [] } = useQuery({
    queryKey: ["alunos"],
    queryFn: api.listStudents,
  });

  const { data: agendamentos = [] } = useQuery({
    queryKey: ["agendamentos-future"],
    queryFn: api.listFutureAppointments,
  });

  const calendarYear = calendarWeek.getFullYear();
  const { data: agendamentosAno = [] } = useQuery({
    queryKey: ["agendamentos-year", calendarYear],
    queryFn: () => api.listAppointmentsByYear(calendarYear),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId || !data || !hora) return toast.error("Preencha aluno, data e horario");
    const dt = new Date(`${data}T${hora}:00`);
    if (isNaN(dt.getTime())) return toast.error("Data/horario invalido");

    setSaving(true);
    try {
      await api.createAppointment({
        studentId: alunoId,
        scheduledAt: dt.toISOString(),
      });

      toast.success("Agendamento confirmado!", {
        description: "O backend validou o horario e processou a automacao configurada.",
      });

      setAlunoId("");
      setData("");
      setHora("");
      qc.invalidateQueries({ queryKey: ["agendamentos-future"] });
      qc.invalidateQueries({ queryKey: ["agendamentos-year"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (err: unknown) {
      toast.error("Nao foi possivel agendar", { description: errorMessage(err, "Erro ao criar agendamento") });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.deleteAppointment(id);
      toast.success("Agendamento removido");
      qc.invalidateQueries({ queryKey: ["agendamentos-future"] });
      qc.invalidateQueries({ queryKey: ["agendamentos-year"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Erro ao remover agendamento"));
    }
  }

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Nova aula</p>
        <h1 className="mt-2 text-3xl font-display font-bold">Agendar</h1>
      </header>

      <Tabs defaultValue="agendar" className="space-y-5">
        <TabsList>
          <TabsTrigger value="agendar"><CalendarPlus className="mr-2 h-4 w-4" />Agendamento</TabsTrigger>
          <TabsTrigger value="calendario"><CalendarDays className="mr-2 h-4 w-4" />Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="agendar">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-primary" /> Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                {alunos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Cadastre um aluno antes de agendar.</p>
                    <Button asChild><Link to="/alunos">Ir para Alunos</Link></Button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <Label>Aluno</Label>
                      <Select value={alunoId} onValueChange={setAlunoId}>
                        <SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
                        <SelectContent>
                          {alunos.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="data">Data</Label>
                        <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="hora">Horario</Label>
                        <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full shadow-[var(--shadow-glow)]" disabled={saving}>
                      {saving ? "Salvando..." : "Confirmar agendamento"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      O sistema valida automaticamente conflitos e dispara o webhook do n8n.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            <UpcomingAppointments appointments={agendamentos} onRemove={remove} />
          </div>
        </TabsContent>

        <TabsContent value="calendario">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Semana</CardTitle>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="secondary" onClick={() => setCalendarWeek((week) => addWeeks(week, -1))} aria-label="Semana anterior">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCalendarWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Hoje</Button>
                <Button type="button" size="icon" variant="secondary" onClick={() => setCalendarWeek((week) => addWeeks(week, 1))} aria-label="Proxima semana">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <WeekCalendar weekStart={calendarWeek} appointments={agendamentosAno} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function UpcomingAppointments({ appointments, onRemove }: { appointments: Appointment[]; onRemove: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-display font-semibold mb-3">Proximas aulas</h2>
      {appointments.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">
          <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />Nenhuma aula futura.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {appointments.map((a) => {
            const d = new Date(a.scheduledAt);
            const tag = isToday(d) ? "Hoje" : isTomorrow(d) ? "Amanha" : format(d, "EEE dd/MM", { locale: ptBR });
            return (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/15 text-primary">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider">{tag.split(" ")[0]}</div>
                      <div className="font-display font-bold">{format(d, "HH:mm")}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.student?.name}</p>
                    <p className="text-xs text-muted-foreground">{format(d, "dd/MM/yyyy 'as' HH:mm")}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => onRemove(a.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WeekCalendar({ weekStart, appointments }: { weekStart: Date; appointments: Appointment[] }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const hours = Array.from({ length: 16 }, (_, index) => index + 6);
  const weekAppointments = appointments.filter((appointment) => {
    const date = new Date(appointment.scheduledAt);
    return date >= weekStart && date <= weekEnd;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[72px_repeat(7,minmax(108px,1fr))] border-b border-border/60 bg-secondary/30">
          <div className="p-3 text-xs text-muted-foreground">Hora</div>
          {days.map((day) => (
            <div key={day.toISOString()} className={[
              "p-3 text-center border-l border-border/60",
              isToday(day) ? "bg-primary/10 text-primary" : "",
            ].join(" ")}>
              <div className="text-xs uppercase text-muted-foreground">{format(day, "EEE", { locale: ptBR })}</div>
              <div className="font-display text-lg font-bold">{format(day, "dd")}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[72px_repeat(7,minmax(108px,1fr))]">
          {hours.map((hour) => (
            <HourRow key={hour} hour={hour} days={days} appointments={weekAppointments} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HourRow({ hour, days, appointments }: { hour: number; days: Date[]; appointments: Appointment[] }) {
  return (
    <>
      <div className="min-h-20 border-b border-border/50 bg-card/70 p-2 text-xs text-muted-foreground">
        {String(hour).padStart(2, "0")}:00
      </div>
      {days.map((day) => {
        const events = appointments
          .filter((appointment) => {
            const date = new Date(appointment.scheduledAt);
            return isSameDay(date, day) && date.getHours() === hour;
          })
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

        return (
          <div key={`${day.toISOString()}-${hour}`} className="min-h-20 border-l border-b border-border/50 bg-secondary/10 p-1">
            <div className="space-y-1">
              {events.map((appointment) => {
                const date = new Date(appointment.scheduledAt);
                return (
                  <div
                    key={appointment.id}
                    className="rounded-md border border-primary/50 bg-primary/15 px-2 py-1.5 text-xs text-primary shadow-sm"
                    title={`${format(date, "HH:mm")} - ${appointment.student.name}`}
                  >
                    <div className="font-semibold">{format(date, "HH:mm")}</div>
                    <div className="truncate text-primary/90">{appointment.student.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
