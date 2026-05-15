import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoFull from "@/assets/greenlink-full.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — GreenLink ADM" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate({ to: "/dashboard", replace: true });
    }
  }

  async function handleGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <img src={logoFull} alt="GreenLink" className="h-10 w-auto brightness-0 invert" />
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            A operação inteira da GreenLink, em um só lugar.
          </h2>
          <p className="mt-3 opacity-90">
            Comercial, contratos, campo, estoque e financeiro — sem planilhas.
          </p>
        </div>
        <p className="text-sm opacity-80">© GreenLink</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-6">
          <img src={logoFull} alt="GreenLink" className="h-8 mb-6 md:hidden" />
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse o painel administrativo.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
              Entrar com Google
            </Button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <Link to="/signup" className="hover:underline">
                Criar conta
              </Link>
              <Link to="/reset-password" className="hover:underline">
                Esqueci a senha
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
