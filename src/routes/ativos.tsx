import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import type { AtivoStatus } from "@/lib/mock/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ativos")({
  head: () => ({ meta: [{ title: "Ativos — GreenLink ADM" }] }),
  component: AtivosPage,
});

function AtivosPage() {
  const { ativos, clientes, ordens, addAtivo, updateAtivo } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tag: "", modelo: "", tipo: "Sensor", clienteId: "", localizacao: "", status: "ativo" as AtivoStatus });

  const submit = () => {
    if (!form.tag || !form.modelo) { toast.error("Preencha tag e modelo."); return; }
    addAtivo({ ...form, clienteId: form.clienteId || undefined });
    toast.success("Ativo cadastrado.");
    setOpen(false);
    setForm({ tag: "", modelo: "", tipo: "Sensor", clienteId: "", localizacao: "", status: "ativo" });
  };

  return (
    <PageContainer>
      <PageHeader title="Ativos" description={`${ativos.length} equipamentos · ${ativos.filter(a => a.status === "ativo").length} ativos`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo ativo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo ativo</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tag</Label><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></div>
                  <div><Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sensor">Sensor</SelectItem>
                        <SelectItem value="Gateway">Gateway</SelectItem>
                        <SelectItem value="Estação">Estação</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Modelo</Label><Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} /></div>
                <div><Label>Cliente</Label>
                  <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                    <SelectTrigger><SelectValue placeholder="Sem cliente" /></SelectTrigger>
                    <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Localização</Label><Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {ativos.map((a) => (
            <div key={a.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between"><p className="font-medium">{a.tag}</p><Badge variant="outline">{a.status}</Badge></div>
              <p className="text-xs text-muted-foreground">{a.modelo}</p>
              <p className="text-xs text-muted-foreground">{clientes.find(c => c.id === a.clienteId)?.nome ?? "Sem cliente"} · {a.localizacao ?? "—"}</p>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tag</TableHead><TableHead>Modelo</TableHead><TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead><TableHead>Local</TableHead><TableHead>Última leitura</TableHead>
              <TableHead>Status</TableHead><TableHead>OS</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {ativos.map((a) => {
                const osCount = ordens.filter(o => o.ativosIds.includes(a.id)).length;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.tag}</TableCell>
                    <TableCell>{a.modelo}</TableCell>
                    <TableCell className="text-muted-foreground">{a.tipo}</TableCell>
                    <TableCell className="text-muted-foreground">{clientes.find(c => c.id === a.clienteId)?.nome ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.localizacao ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(a.ultimaLeitura)}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={(v) => updateAtivo(a.id, { status: v as AtivoStatus })}>
                        <SelectTrigger className="h-7 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="baixado">Baixado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{osCount}</TableCell>
                  </TableRow>
                );
              })}
              {!ativos.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum ativo.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
