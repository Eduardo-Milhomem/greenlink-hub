import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import logoFull from "@/assets/greenlink-full.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — GreenLink ADM" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <img src={logoFull} alt="GreenLink" className="h-10 w-auto brightness-0 invert" />
        <div>
          <h2 className="text-4xl font-bold leading-tight">A operação inteira da GreenLink, em um só lugar.</h2>
          <p className="mt-3 opacity-90">Comercial, contratos, campo, estoque e financeiro — sem planilhas.</p>
        </div>
        <p className="text-sm opacity-80">© GreenLink</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-6">
          <img src={logoFull} alt="GreenLink" className="h-8 mb-6 md:hidden" />
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse o painel administrativo.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="admin@greenlink.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" defaultValue="••••••••" />
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo — qualquer credencial funciona.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
