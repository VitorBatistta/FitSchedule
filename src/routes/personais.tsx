import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { api, errorMessage, type PersonalTrainer } from "@/lib/api";
import { CalendarCheck, GraduationCap, Mail, Pencil, Phone, Plus, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/personais")({
  head: () => ({ meta: [{ title: "Personal - FitSchedule" }] }),
  component: PersonaisPage,
});

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
    [a && `(${a}`, a.length === 2 ? ") " : "", b, c && `-${c}`].filter(Boolean).join(""));
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
}

function PersonaisPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalTrainer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PersonalTrainer | null>(null);

  const { data: pessoais = [], isLoading } = useQuery({
    queryKey: ["personais"],
    queryFn: api.listPersonalTrainers,
  });

  function openNew() { setEditing(null); setOpen(true); }
  function openEdit(personal: PersonalTrainer) { setEditing(personal); setOpen(true); }

  async function handleSave(form: FormData) {
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const whatsapp = String(form.get("whatsapp") || "").trim();
    const password = String(form.get("password") || "").trim();
    const canManageStudents = form.get("canManageStudents") === "on";
    const canManageAppointments = form.get("canManageAppointments") === "on";
    const admin = form.get("admin") === "on";
    const active = form.get("active") === "on";

    if (!name || !email || !whatsapp || (!editing && !password)) {
      toast.error("Nome, e-mail, WhatsApp e senha são obrigatórios");
      return;
    }

    try {
      const payload = { name, email, whatsapp, password: password || undefined, canManageStudents, canManageAppointments, admin, active };
      if (editing) {
        await api.updatePersonalTrainer(editing.id, payload);
        toast.success("Personal atualizado");
      } else {
        await api.createPersonalTrainer(payload);
        toast.success("Personal cadastrado");
      }
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["personais"] });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Erro ao salvar personal"));
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deletePersonalTrainer(confirmDelete.id);
      toast.success("Personal removido");
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["personais"] });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Erro ao remover personal"));
    }
  }

  return (
    <AppShell>
      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Equipe</p>
          <h1 className="mt-2 text-3xl font-display font-bold">Personal</h1>
          <p className="text-muted-foreground">{pessoais.length} cadastrado(s)</p>
        </div>
        <Button onClick={openNew} size="lg" className="shadow-[var(--shadow-glow)]">
          <Plus className="mr-2 h-4 w-4" /> Novo personal
        </Button>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : pessoais.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserCog className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>Nenhum personal cadastrado.</p>
            <Button onClick={openNew} className="mt-4">Cadastrar primeiro personal</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pessoais.map((personal) => (
            <Card key={personal.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/15 text-primary font-display font-bold">
                  {personal.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">{personal.name}</p>
                    {personal.admin && <Badge>Admin</Badge>}
                    <Badge variant={personal.active ? "secondary" : "outline"}>{personal.active ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{personal.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{personal.whatsapp}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {personal.canManageStudents && (
                      <Badge className="rounded-full"><GraduationCap className="mr-1 h-3 w-3" />Alunos</Badge>
                    )}
                    {personal.canManageAppointments && (
                      <Badge className="rounded-full"><CalendarCheck className="mr-1 h-3 w-3" />Agendamentos</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(personal)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(personal)} aria-label="Excluir"
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar personal" : "Novo personal"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={editing?.name} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={editing?.email} required maxLength={160} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp" name="whatsapp" defaultValue={editing?.whatsapp}
                placeholder="(11) 91234-5678" required
                onChange={(e) => { e.currentTarget.value = maskPhone(e.currentTarget.value); }}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                placeholder={editing ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
                required={!editing}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 p-4">
              <ToggleRow
                id="canManageStudents"
                label="Pode cadastrar e gerenciar alunos"
                defaultChecked={editing?.canManageStudents ?? true}
              />
              <ToggleRow
                id="canManageAppointments"
                label="Pode criar e gerenciar agendamentos"
                defaultChecked={editing?.canManageAppointments ?? true}
              />
              <ToggleRow
                id="admin"
                label="Administrador do sistema"
                defaultChecked={editing?.admin ?? false}
              />
              <ToggleRow id="active" label="Cadastro ativo" defaultChecked={editing?.active ?? true} />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover personal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>{confirmDelete?.name}</strong> da equipe. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function ToggleRow({ id, label, defaultChecked }: { id: string; label: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} name={id} defaultChecked={defaultChecked} />
    </div>
  );
}
