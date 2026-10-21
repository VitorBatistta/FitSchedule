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

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login - FitSchedule" }] }),
  component: LoginPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleLogin(formElement: HTMLFormElement) {
    const form = new FormData(formElement);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "E-mail obrigatório.";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Insira um e-mail válido.";
    }

    if (!password) {
      newErrors.password = "Senha obrigatória.";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.currentTarget);
            }}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={() => {
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && !EMAIL_REGEX.test(val)) {
                    setErrors((prev) => ({ ...prev, email: "Insira um e-mail válido." }));
                  }
                }}
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                onChange={() => {
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={cn(errors.password && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">{errors.password}</p>
              )}
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
