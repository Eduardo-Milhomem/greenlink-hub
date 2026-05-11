import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useTheme } from "@/components/layout/theme-provider";
import { Moon, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — GreenLink ADM" }] }),
  component: Config,
});

function Config() {
  const { theme, toggle } = useTheme();
  return (
    <PageContainer>
      <PageHeader title="Configurações" description="Perfil, aparência e preferências." />
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold">Perfil</h3>
          <div className="space-y-1.5"><Label>Nome</Label><Input defaultValue="Administrador GreenLink" /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" defaultValue="admin@greenlink.com" /></div>
          <Button onClick={() => toast.success("Perfil salvo (demo)")}>Salvar</Button>
        </Card>
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold">Aparência</h3>
          <p className="text-sm text-muted-foreground">Tema atual: <span className="font-medium">{theme === "dark" ? "Escuro" : "Claro"}</span></p>
          <Button variant="outline" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
            Alternar tema
          </Button>
        </Card>
        <Card className="p-5 space-y-3 md:col-span-2">
          <h3 className="font-semibold">Dados de demonstração</h3>
          <p className="text-sm text-muted-foreground">Os dados estão salvos no seu navegador (localStorage).</p>
          <Button
            variant="destructive"
            onClick={() => { localStorage.removeItem("greenlink-adm-v1"); location.reload(); }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Resetar dados
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
