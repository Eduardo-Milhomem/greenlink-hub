import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useTicket, useCustomer, useCreateServiceOrder } from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import { ArrowLeft, Send, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TicketStatus } from "@/types/ticket";

export const Route = createFileRoute("/suporte/$id")({
  head: () => ({ meta: [{ title: "Ticket — GreenLink ADM" }] }),
  component: TicketDetalhe,
});

const statusLabel: Record<TicketStatus, string> = {
  new: "Novo",
  in_progress: "Em andamento",
  waiting_customer: "Aguardando cliente",
  resolved: "Resolvido",
  cancelled: "Cancelado",
};

function TicketDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: t, isLoading: isLoadingTicket } = useTicket(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(t?.customerId);
  const createOS = useCreateServiceOrder();

  const [msg, setMsg] = useState("");
  const [interno, setInterno] = useState(false);

  const isLoading = isLoadingTicket || isLoadingCustomer;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!t) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Ticket não encontrado.</p>
      </PageContainer>
    );
  }

  const enviar = () => {
    if (!msg.trim()) return;
    toast.info("Lógica de mensagem em serviços.");
    setMsg("");
  };

  const converter = async () => {
    try {
      await createOS.mutateAsync({
        osNumber: `OS-${Math.floor(Math.random() * 10000)}`,
        description: `Atendimento via Ticket — ${t.subject}`,
        customerId: t.customerId,
        priority: t.priority,
        ticketId: t.id,
      });
      toast.success(`OS criada a partir deste ticket.`);
      navigate({ to: "/os" });
    } catch (err) {
      toast.error("Erro ao gerar OS.");
    }
  };

  return (
    <PageContainer>
      <Link
        to="/suporte"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Suporte
      </Link>
      <PageHeader
        title={`${t.ticketNumber} — ${t.subject}`}
        description={`${cli?.legalName ?? "—"} · ${t.channel}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Select value={t.status} onValueChange={(v) => console.log("update ticket status", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusLabel) as TicketStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={converter} disabled={createOS.isPending}>
              {createOS.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4 mr-2" />
              )}
              Gerar OS
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">Conversa</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {t.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg p-3 ${m.isInternal ? "bg-warning/10 border border-warning/30" : "bg-muted"}`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">
                    {m.authorUserId ?? "Sistema"}
                    {m.isInternal && " · nota interna"}
                  </span>
                  <span>{formatDate(m.createdAt)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
            {!t.messages.length && <p className="text-sm text-muted-foreground">Sem mensagens.</p>}
          </div>
          <div className="mt-4 space-y-2">
            <Textarea
              rows={3}
              placeholder={interno ? "Nota interna…" : "Responder ao cliente…"}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <label className="text-xs inline-flex items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={interno}
                  onChange={(e) => setInterno(e.target.checked)}
                />
                Nota interna
              </label>
              <Button onClick={enviar}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Detalhes</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{cli?.legalName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prioridade</span>
              <Badge>{t.priority}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Canal</span>
              <span>{t.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SLA</span>
              <span>{formatDate(t.slaDueAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aberto em</span>
              <span>{formatDate(t.createdAt)}</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
