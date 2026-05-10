import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendToWebhook } from "@/lib/webhook";

export const Route = createFileRoute("/agendar")({
  head: () => ({ meta: [{ title: "Agendar — FitSchedule" }] }),
  component: AgendarPage,
});

function AgendarPage() {
  const qc = useQueryClient();
  const [alunoId, setAlunoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: alunos = [] } = useQuery({
    queryKey: ["alunos"],
    queryFn: async () => (await supabase.from("alunos").select("id, nome, whatsapp").order("nome")).data ?? [],
  });

  const { data: agendamentos = [] } = useQuery({
    queryKey: ["agendamentos-future"],
    queryFn: async () => {
      const { data } = await supabase
        .from("agendamentos")
        .select("id, data_hora, status, alunos(nome, whatsapp)")
        .gte("data_hora", new Date().toISOString())
        .order("data_hora");
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId || !data || !hora) return toast.error("Preencha aluno, data e horário");
    const dt = new Date(`${data}T${hora}:00`);
    if (isNaN(dt.getTime())) return toast.error("Data/horário inválido");
    if (dt < new Date()) return toast.error("Não é possível agendar no passado");

    setSaving(true);
    try {
      // conflict check
      const iso = dt.toISOString();
      const { data: conflict } = await supabase
        .from("agendamentos")
        .select("id, alunos(nome)")
        .eq("data_hora", iso)
        .maybeSingle();

      if (conflict) {
        toast.error("Horário ocupado", {
          description: `Já existe agendamento com ${(conflict as any).alunos?.nome ?? "outro aluno"} neste horário.`,
        });
        return;
      }

      const aluno = alunos.find((a: any) => a.id === alunoId);
      const { data: inserted, error } = await supabase
        .from("agendamentos")
        .insert({ aluno_id: alunoId, data_hora: iso })
        .select("id")
        .single();

      if (error) {
        if ((error as any).code === "23505") {
          toast.error("Horário ocupado", { description: "Já existe outro agendamento neste exato horário." });
        } else toast.error(error.message);
        return;
      }

      const webhook = await sendToWebhook({
        event: "agendamento.criado",
        agendamento_id: inserted!.id,
        nome: aluno?.nome,
        whatsapp: aluno?.whatsapp,
        data_hora_agendamento: iso,
        data_hora_local: format(dt, "dd/MM/yyyy HH:mm", { locale: ptBR }),
      });

      toast.success("Agendamento confirmado!", {
        description: webhook.sent ? "Webhook enviado ao n8n." : "Configure o webhook em Configurações para automações.",
      });

      setAlunoId(""); setData(""); setHora("");
      qc.invalidateQueries({ queryKey: ["agendamentos-future"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("agendamentos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Agendamento removido");
    qc.invalidateQueries({ queryKey: ["agendamentos-future"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  }

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Nova aula</p>
        <h1 className="mt-2 text-3xl font-display font-bold">Agendar</h1>
      </header>

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
                      {alunos.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
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
                    <Label htmlFor="hora">Horário</Label>
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

        <div>
          <h2 className="text-lg font-display font-semibold mb-3">Próximas aulas</h2>
          {agendamentos.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />Nenhuma aula futura.
            </CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {agendamentos.map((a: any) => {
                const d = new Date(a.data_hora);
                const tag = isToday(d) ? "Hoje" : isTomorrow(d) ? "Amanhã" : format(d, "EEE dd/MM", { locale: ptBR });
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
                        <p className="font-semibold truncate">{a.alunos?.nome}</p>
                        <p className="text-xs text-muted-foreground">{format(d, "dd/MM/yyyy 'às' HH:mm")}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => remove(a.id)}
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
      </div>
    </AppShell>
  );
}
