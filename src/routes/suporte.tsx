import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useTickets, useCustomers } from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import type { TicketStatus, TicketPriority } from "@/types/ticket";

export const Route = createFileRoute("/suporte")({
  head: () => ({ meta: [{ title: "Suporte — GreenLink ADM" }] }),
  component: Suporte,
});

const statusLabel: Record<TicketStatus, string> = {
  new: "Novo",
  in_progress: "Em andamento",
  waiting_customer: "Aguardando cliente",
  resolved: "Resolvido",
  cancelled: "Cancelado",
};

const prioVar = (p: TicketPriority) => (p === "urgent" || p === "high" ? "destructive" : "outline");

function Suporte() {
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const [filter, setFilter] = useState<"todos" | TicketStatus>("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    customerId: "",
    priority: "medium" as TicketPriority,
    message: "",
  });

  const isLoading = isLoadingTickets || isLoadingCustomers;

  const filtrados = filter === "todos" ? tickets : tickets.filter((t) => t.status === filter);

  const submit = async () => {
    // console.log("create ticket", form);
    setOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Suporte"
        description={`${tickets.length} tickets · ${tickets.filter((t) => t.status !== "resolved").length} em aberto`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Assunto</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={form.customerId}
                    onValueChange={(v) => setForm({ ...form, customerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm({ ...form, priority: v as TicketPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mensagem inicial</Label>
                  <Textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit}>Abrir ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={filter === "todos" ? "default" : "outline"}
          onClick={() => setFilter("todos")}
        >
          Todos
        </Button>
        {(Object.keys(statusLabel) as TicketStatus[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {statusLabel[s]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((t) => {
            const cli = customers.find((c) => c.id === t.customerId);
            return (
              <Link key={t.id} to="/suporte/$id" params={{ id: t.id }}>
                <Card className="p-4 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{t.ticketNumber}</span>
                    <Badge variant={prioVar(t.priority)}>{t.priority}</Badge>
                  </div>
                  <p className="font-medium leading-tight">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cli?.legalName ?? "—"} · {t.channel}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
                    <Badge variant="outline">{statusLabel[t.status]}</Badge>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {t.messages.length}
                    </span>
                  </div>
                  {t.slaDueAt && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      SLA: {formatDate(t.slaDueAt)}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
          {!filtrados.length && <p className="text-sm text-muted-foreground">Sem tickets.</p>}
        </div>
      )}
    </PageContainer>
  );
}
