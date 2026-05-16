import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Phone, Cake, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { api, errorMessage, type Student } from "@/lib/api";

export const Route = createFileRoute("/alunos")({
  head: () => ({ meta: [{ title: "Alunos — FitSchedule" }] }),
  component: AlunosPage,
});

type Aluno = Student;

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
    [a && `(${a}`, a.length === 2 ? ") " : "", b, c && `-${c}`].filter(Boolean).join(""));
  return d.replace(/(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
}

function AlunosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Aluno | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Aluno | null>(null);

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ["alunos"],
    queryFn: api.listStudents,
  });

  function openNew() { setEditing(null); setOpen(true); }
  function openEdit(a: Aluno) { setEditing(a); setOpen(true); }

  async function handleSave(form: FormData) {
    const name = String(form.get("nome") || "").trim();
    const whatsapp = String(form.get("whatsapp") || "").trim();
    const birthDate = String(form.get("data_nascimento") || "") || null;
    if (!name || !whatsapp) {
      toast.error("Nome e WhatsApp são obrigatórios");
      return;
    }
    try {
      if (editing) {
        await api.updateStudent(editing.id, { name, whatsapp, birthDate });
        toast.success("Aluno atualizado");
      } else {
        await api.createStudent({ name, whatsapp, birthDate });
        toast.success("Aluno cadastrado");
      }
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["alunos"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Erro ao salvar aluno"));
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteStudent(confirmDelete.id);
      toast.success("Aluno removido");
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["alunos"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Erro ao remover aluno"));
    }
  }

  return (
    <AppShell>
      <header className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Cadastro</p>
          <h1 className="mt-2 text-3xl font-display font-bold">Alunos</h1>
          <p className="text-muted-foreground">{alunos.length} cadastrado(s)</p>
        </div>
        <Button onClick={openNew} size="lg" className="shadow-[var(--shadow-glow)]">
          <Plus className="mr-2 h-4 w-4" /> Novo aluno
        </Button>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : alunos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>Nenhum aluno cadastrado.</p>
            <Button onClick={openNew} className="mt-4">Cadastrar primeiro aluno</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {alunos.map((a) => (
            <Card key={a.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/15 text-primary font-display font-bold">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{a.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.whatsapp}</span>
                    {a.birthDate && (
                      <span className="flex items-center gap-1"><Cake className="h-3 w-3" />{format(new Date(a.birthDate + "T00:00"), "dd/MM/yyyy")}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(a)} aria-label="Excluir"
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
            <DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" defaultValue={editing?.name} required maxLength={120} />
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
              <Label htmlFor="data_nascimento">Data de nascimento</Label>
              <Input id="data_nascimento" name="data_nascimento" type="date" defaultValue={editing?.birthDate ?? ""} />
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
            <AlertDialogTitle>Remover aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>{confirmDelete?.name}</strong> e todos os agendamentos vinculados. Não pode ser desfeita.
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
