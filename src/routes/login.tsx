import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorMessage } from "@/lib/api";
import { firstAllowedPath, setPersonalSession } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login - FitSchedule" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(form: FormData) {
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      toast.error("Informe e-mail e senha");
      return;
    }

    setLoading(true);
    try {
      const session = await api.login({ email, password });
      setPersonalSession(session);
      window.location.href = firstAllowedPath(session);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Não foi possível entrar"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-card)]">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl">FitSchedule</CardTitle>
              <p className="text-sm text-muted-foreground">Acesso do personal</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(new FormData(e.currentTarget)); }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" size="lg" className="w-full shadow-[var(--shadow-glow)]" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
