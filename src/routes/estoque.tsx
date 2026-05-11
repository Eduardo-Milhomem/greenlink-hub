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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, calcEstoque, formatDate } from "@/lib/mock/store";
import type { MovTipo } from "@/lib/mock/types";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/estoque")({
  head: () => ({ meta: [{ title: "Estoque — GreenLink ADM" }] }),
  component: EstoquePage,
});

const ESTOQUE_MIN = 10;

function EstoquePage() {
  const { catalogo, movimentacoes, addMovimentacao } = useAppStore();
  const produtos = catalogo.filter((i) => i.tipo !== "servico");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ itemId: "", tipo: "entrada" as MovTipo, quantidade: "", motivo: "" });

  const submit = () => {
    if (!form.itemId || !form.quantidade) { toast.error("Preencha item e quantidade."); return; }
    addMovimentacao({ itemId: form.itemId, tipo: form.tipo, quantidade: Number(form.quantidade), motivo: form.motivo });
    toast.success("Movimentação registrada.");
    setOpen(false);
    setForm({ itemId: "", tipo: "entrada", quantidade: "", motivo: "" });
  };

  const criticos = produtos.filter((i) => calcEstoque(i.id, movimentacoes) < ESTOQUE_MIN);

  return (
    <PageContainer>
      <PageHeader title="Estoque" description={`${produtos.length} itens · ${criticos.length} abaixo do mínimo`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Movimentação</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova movimentação</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Item</Label>
                  <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.codigo} — {p.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as MovTipo })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                        <SelectItem value="ajuste">Ajuste</SelectItem>
                        <SelectItem value="reserva">Reserva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Quantidade</Label><Input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} /></div>
                </div>
                <div><Label>Motivo</Label><Input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Registrar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />

      <Tabs defaultValue="saldos">
        <TabsList><TabsTrigger value="saldos">Saldos</TabsTrigger><TabsTrigger value="movs">Movimentações</TabsTrigger></TabsList>
        <TabsContent value="saldos">
          <Card className="p-3 md:p-4">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Código</TableHead><TableHead>Item</TableHead>
                <TableHead>Unidade</TableHead><TableHead>Saldo</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {produtos.map((p) => {
                  const saldo = calcEstoque(p.id, movimentacoes);
                  const critico = saldo < ESTOQUE_MIN;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                      <TableCell>{p.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{p.unidade}</TableCell>
                      <TableCell className="font-semibold">{saldo}</TableCell>
                      <TableCell>
                        {critico
                          ? <Badge variant="destructive" className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Crítico</Badge>
                          : <Badge variant="outline">OK</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="movs">
          <Card className="p-3 md:p-4">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Data</TableHead><TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead><TableHead>Qtd</TableHead><TableHead>Motivo</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {movimentacoes.map((m) => {
                  const item = catalogo.find((c) => c.id === m.itemId);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">{formatDate(m.criadoEm)}</TableCell>
                      <TableCell>{item?.codigo} — {item?.nome}</TableCell>
                      <TableCell><Badge variant="outline">{m.tipo}</Badge></TableCell>
                      <TableCell className="font-semibold">{m.quantidade}</TableCell>
                      <TableCell className="text-muted-foreground">{m.motivo ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
                {!movimentacoes.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem movimentações.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
