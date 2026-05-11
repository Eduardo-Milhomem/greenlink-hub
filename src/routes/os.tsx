import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import { OS_STATUS, type OSPrioridade, type OSStatus } from "@/lib/mock/types";
import { Plus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/os")({
  head: () => ({ meta: [{ title: "Ordens de Serviço — GreenLink ADM" }] }),
  component: OSList,
});

const prioColor: Record<OSPrioridade, string> = {
  baixa: "bg-muted text-foreground",
  media: "bg-primary/10 text-primary",
  alta: "bg-warning/15 text-warning-foreground",
  critica: "bg-destructive/15 text-destructive",
};

function OSList() {
  const { ordens, clientes, addOS } = useAppStore();
  const [filter, setFilter] = useState<"todas" | OSStatus>("todas");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", clienteId: "", prioridade: "media" as OSPrioridade, endereco: "", tecnico: "" });

  const filtradas = filter === "todas" ? ordens : ordens.filter((o) => o.status === filter);

  const submit = () => {
    if (!form.titulo || !form.clienteId) { toast.error("Preencha título e cliente."); return; }
    addOS({ ...form, tarefas: [], ativosIds: [] });
    toast.success("OS criada.");
    setOpen(false);
    setForm({ titulo: "", clienteId: "", prioridade: "media", endereco: "", tecnico: "" });
  };

  return (
    <PageContainer>
      <PageHeader title="Ordens de Serviço" description={`${ordens.length} OS · ${ordens.filter(o => o.status !== "concluida" && o.status !== "cancelada").length} em aberto`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova OS</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova OS</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
                <div><Label>Cliente</Label>
                  <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Prioridade</Label>
                    <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v as OSPrioridade })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Técnico</Label><Input value={form.tecnico} onChange={(e) => setForm({ ...form, tecnico: e.target.value })} /></div>
                </div>
                <div><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="todas">Todas ({ordens.length})</TabsTrigger>
          {OS_STATUS.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>{s.label} ({ordens.filter(o => o.status === s.id).length})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtradas.map((o) => {
          const cli = clientes.find((c) => c.id === o.clienteId);
          const total = o.tarefas.length; const feitas = o.tarefas.filter(t => t.feita).length;
          return (
            <Link key={o.id} to="/os/$id" params={{ id: o.id }}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{o.numero}</span>
                  <span className={`text-[10px] uppercase tracking-wide rounded-md px-2 py-0.5 ${prioColor[o.prioridade]}`}>{o.prioridade}</span>
                </div>
                <p className="font-medium leading-tight">{o.titulo}</p>
                <p className="text-xs text-muted-foreground mt-1">{cli?.nome ?? "—"}</p>
                {o.endereco && <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{o.endereco}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
                  <Badge variant="outline">{OS_STATUS.find(s => s.id === o.status)?.label}</Badge>
                  <span className="text-muted-foreground inline-flex items-center gap-1">
                    {o.sla && <><Clock className="h-3 w-3" />{formatDate(o.sla)}</>}
                  </span>
                </div>
                {total > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(feitas / total) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{feitas}/{total} tarefas</p>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
        {!filtradas.length && <p className="text-sm text-muted-foreground">Nenhuma OS.</p>}
      </div>
    </PageContainer>
  );
}
