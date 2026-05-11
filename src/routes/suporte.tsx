import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import type { TicketCanal, TicketPrioridade } from "@/lib/mock/types";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/suporte")({
  head: () => ({ meta: [{ title: "Suporte — GreenLink ADM" }] }),
  component: Suporte,
});

const statusLabel: Record<string, string> = {
  novo: "Novo", andamento: "Em andamento", aguardando: "Aguardando cliente", resolvido: "Resolvido",
};
const prioVar = (p: string) => p === "critica" ? "destructive" : p === "alta" ? "default" : "outline";

function Suporte() {
  const { tickets, clientes, addTicket } = useAppStore();
  const [filter, setFilter] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    assunto: "", clienteId: "", canal: "email" as TicketCanal,
    prioridade: "media" as TicketPrioridade, mensagem: "",
  });

  const filtrados = filter === "todos" ? tickets : tickets.filter((t) => t.status === filter);

  const submit = () => {
    if (!form.assunto || !form.clienteId) { toast.error("Preencha assunto e cliente."); return; }
    addTicket({
      assunto: form.assunto, clienteId: form.clienteId, canal: form.canal, prioridade: form.prioridade,
      mensagens: form.mensagem ? [{ id: Math.random().toString(36).slice(2, 10), autor: "Cliente", interno: false, texto: form.mensagem, criadoEm: new Date().toISOString() }] : [],
    });
    toast.success("Ticket aberto.");
    setOpen(false);
    setForm({ assunto: "", clienteId: "", canal: "email", prioridade: "media", mensagem: "" });
  };

  return (
    <PageContainer>
      <PageHeader title="Suporte" description={`${tickets.length} tickets · ${tickets.filter(t => t.status !== "resolvido").length} em aberto`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo ticket</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo ticket</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Assunto</Label><Input value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} /></div>
                <div><Label>Cliente</Label>
                  <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Canal</Label>
                    <Select value={form.canal} onValueChange={(v) => setForm({ ...form, canal: v as TicketCanal })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="portal">Portal</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Prioridade</Label>
                    <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v as TicketPrioridade })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Mensagem inicial</Label><Textarea rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Abrir ticket</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />

      <div className="flex flex-wrap gap-2 mb-4">
        {["todos", "novo", "andamento", "aguardando", "resolvido"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s === "todos" ? "Todos" : statusLabel[s]}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map((t) => {
          const cli = clientes.find((c) => c.id === t.clienteId);
          return (
            <Link key={t.id} to="/suporte/$id" params={{ id: t.id }}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{t.numero}</span>
                  <Badge variant={prioVar(t.prioridade)}>{t.prioridade}</Badge>
                </div>
                <p className="font-medium leading-tight">{t.assunto}</p>
                <p className="text-xs text-muted-foreground mt-1">{cli?.nome ?? "—"} · {t.canal}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs">
                  <Badge variant="outline">{statusLabel[t.status]}</Badge>
                  <span className="text-muted-foreground inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t.mensagens.length}</span>
                </div>
                {t.sla && <p className="text-[10px] text-muted-foreground mt-2">SLA: {formatDate(t.sla)}</p>}
              </Card>
            </Link>
          );
        })}
        {!filtrados.length && <p className="text-sm text-muted-foreground">Sem tickets.</p>}
      </div>
    </PageContainer>
  );
}
