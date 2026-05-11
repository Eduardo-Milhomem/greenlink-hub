import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import { OS_STATUS, type OSStatus } from "@/lib/mock/types";
import { ArrowLeft, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/os/$id")({
  head: () => ({ meta: [{ title: "OS — GreenLink ADM" }] }),
  component: OSDetalhe,
  notFoundComponent: () => <PageContainer><p className="text-muted-foreground">OS não encontrada.</p></PageContainer>,
});

function OSDetalhe() {
  const { id } = Route.useParams();
  const { ordens, clientes, ativos, updateOS, toggleTarefa, concluirOS } = useAppStore();
  const os = ordens.find((o) => o.id === id);
  if (!os) throw notFound();
  const cli = clientes.find((c) => c.id === os.clienteId);
  const vinculados = ativos.filter((a) => os.ativosIds.includes(a.id));
  const [novaTarefa, setNovaTarefa] = useState("");
  const [horas, setHoras] = useState(String(os.horasGastas ?? 0));
  const [obs, setObs] = useState(os.observacao ?? "");

  const addTarefa = () => {
    if (!novaTarefa.trim()) return;
    updateOS(os.id, { tarefas: [...os.tarefas, { id: Math.random().toString(36).slice(2, 10), descricao: novaTarefa, feita: false }] });
    setNovaTarefa("");
  };

  const feitas = os.tarefas.filter(t => t.feita).length;

  return (
    <PageContainer>
      <Link to="/os" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Ordens de Serviço
      </Link>
      <PageHeader title={`${os.numero} — ${os.titulo}`} description={`${cli?.nome ?? "—"} · ${os.tecnico ?? "Sem técnico"}`}
        actions={<div className="flex gap-2 flex-wrap">
          <Select value={os.status} onValueChange={(v) => updateOS(os.id, { status: v as OSStatus })}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>{OS_STATUS.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          {os.status !== "concluida" && <Button onClick={() => { concluirOS(os.id); toast.success("OS concluída."); }}><CheckCircle2 className="h-4 w-4 mr-2" />Concluir</Button>}
        </div>} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Checklist ({feitas}/{os.tarefas.length})</h2>
            </div>
            <ul className="space-y-2">
              {os.tarefas.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <Checkbox checked={t.feita} onCheckedChange={() => toggleTarefa(os.id, t.id)} />
                  <span className={t.feita ? "line-through text-muted-foreground" : ""}>{t.descricao}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              <Input placeholder="Nova tarefa" value={novaTarefa} onChange={(e) => setNovaTarefa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTarefa()} />
              <Button onClick={addTarefa}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Registro</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase text-muted-foreground">Horas gastas</label>
                <Input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} onBlur={() => updateOS(os.id, { horasGastas: Number(horas) })} />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs uppercase text-muted-foreground">Observações / assinatura</label>
              <Textarea value={obs} onChange={(e) => setObs(e.target.value)} onBlur={() => updateOS(os.id, { observacao: obs })} rows={3} />
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Detalhes</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge>{OS_STATUS.find(s=>s.id===os.status)?.label}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Prioridade</span><span className="font-medium uppercase">{os.prioridade}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span>{formatDate(os.sla)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Endereço</span><span className="text-right">{os.endereco ?? "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Aberta em</span><span>{formatDate(os.criadoEm)}</span></div>
              {os.concluidaEm && <div className="flex justify-between"><span className="text-muted-foreground">Concluída em</span><span>{formatDate(os.concluidaEm)}</span></div>}
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Ativos vinculados</h2>
            {vinculados.length ? <ul className="space-y-1 text-sm">
              {vinculados.map((a) => <li key={a.id} className="flex justify-between"><Link to="/ativos" className="hover:text-primary">{a.tag}</Link><span className="text-muted-foreground text-xs">{a.modelo}</span></li>)}
            </ul> : <p className="text-sm text-muted-foreground">Nenhum.</p>}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
