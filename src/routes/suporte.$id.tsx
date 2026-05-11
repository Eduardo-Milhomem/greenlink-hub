import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import type { TicketStatus } from "@/lib/mock/types";
import { ArrowLeft, Send, Wrench } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/suporte/$id")({
  head: () => ({ meta: [{ title: "Ticket — GreenLink ADM" }] }),
  component: TicketDetalhe,
  notFoundComponent: () => <PageContainer><p className="text-muted-foreground">Ticket não encontrado.</p></PageContainer>,
});

function TicketDetalhe() {
  const { id } = Route.useParams();
  const { tickets, clientes, addMensagemTicket, updateTicket, ticketParaOS } = useAppStore();
  const t = tickets.find((x) => x.id === id);
  if (!t) throw notFound();
  const cli = clientes.find((c) => c.id === t.clienteId);
  const [msg, setMsg] = useState("");
  const [interno, setInterno] = useState(false);

  const enviar = () => {
    if (!msg.trim()) return;
    addMensagemTicket(t.id, { autor: "Suporte GL", interno, texto: msg });
    setMsg("");
  };

  const converter = () => {
    const os = ticketParaOS(t.id);
    if (os) toast.success(`OS ${os.numero} criada a partir deste ticket.`);
  };

  return (
    <PageContainer>
      <Link to="/suporte" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Suporte
      </Link>
      <PageHeader title={`${t.numero} — ${t.assunto}`} description={`${cli?.nome ?? "—"} · ${t.canal}`}
        actions={<div className="flex gap-2 flex-wrap">
          <Select value={t.status} onValueChange={(v) => updateTicket(t.id, { status: v as TicketStatus })}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="andamento">Em andamento</SelectItem>
              <SelectItem value="aguardando">Aguardando cliente</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>
          {!t.osId && <Button onClick={converter}><Wrench className="h-4 w-4 mr-2" />Gerar OS</Button>}
        </div>} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">Conversa</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {t.mensagens.map((m) => (
              <div key={m.id} className={`rounded-lg p-3 ${m.interno ? "bg-warning/10 border border-warning/30" : "bg-muted"}`}>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">{m.autor}{m.interno && " · nota interna"}</span>
                  <span>{formatDate(m.criadoEm)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.texto}</p>
              </div>
            ))}
            {!t.mensagens.length && <p className="text-sm text-muted-foreground">Sem mensagens.</p>}
          </div>
          <div className="mt-4 space-y-2">
            <Textarea rows={3} placeholder={interno ? "Nota interna…" : "Responder ao cliente…"} value={msg} onChange={(e) => setMsg(e.target.value)} />
            <div className="flex items-center justify-between">
              <label className="text-xs inline-flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" checked={interno} onChange={(e) => setInterno(e.target.checked)} />
                Nota interna
              </label>
              <Button onClick={enviar}><Send className="h-4 w-4 mr-2" />Enviar</Button>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Detalhes</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{cli?.nome ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prioridade</span><Badge>{t.prioridade}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Canal</span><span>{t.canal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span>{formatDate(t.sla)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Aberto em</span><span>{formatDate(t.criadoEm)}</span></div>
            {t.osId && <div className="flex justify-between"><span className="text-muted-foreground">OS</span>
              <Link to="/os/$id" params={{ id: t.osId }} className="text-primary hover:underline">Ver OS</Link></div>}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
