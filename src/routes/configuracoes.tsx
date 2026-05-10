import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { getWebhookUrl, setWebhookUrl, sendToWebhook } from "@/lib/webhook";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — FitSchedule" }] }),
  component: Config,
});

function Config() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWebhookUrl().then((u) => { setUrl(u); setLoading(false); });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setWebhookUrl(url.trim());
      toast.success("Webhook salvo");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar");
    } finally { setSaving(false); }
  }

  async function test() {
    if (!url.trim()) return toast.error("Informe a URL primeiro");
    await setWebhookUrl(url.trim());
    const r = await sendToWebhook({ event: "test", message: "Teste do FitSchedule", at: new Date().toISOString() });
    if (r.sent) toast.success("Payload de teste enviado");
    else toast.error("Falha ao enviar", { description: r.reason });
  }

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Sistema</p>
        <h1 className="mt-2 text-3xl font-display font-bold">Configurações</h1>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-primary" /> Webhook n8n</CardTitle>
          <CardDescription>
            URL para onde os agendamentos serão enviados via POST JSON. Use para integrar com Google Agenda, lembretes WhatsApp, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://n8n.seudominio.com/webhook/fitschedule"
                disabled={loading}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving || loading} className="shadow-[var(--shadow-glow)]">
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button type="button" variant="secondary" onClick={test} disabled={loading}>
                <Send className="mr-2 h-4 w-4" /> Enviar teste
              </Button>
            </div>

            <div className="mt-6 rounded-lg border border-border/60 bg-secondary/40 p-4 text-sm">
              <p className="font-semibold mb-2">Payload enviado:</p>
              <pre className="text-xs text-muted-foreground overflow-x-auto">{`{
  "event": "agendamento.criado",
  "agendamento_id": "uuid",
  "nome": "Nome do aluno",
  "whatsapp": "(11) 91234-5678",
  "data_hora_agendamento": "2025-..."
}`}</pre>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
