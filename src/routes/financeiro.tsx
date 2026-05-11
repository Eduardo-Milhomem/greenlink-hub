import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";
import type { LancamentoTipo } from "@/lib/mock/types";
import { Plus, CheckCircle2, RotateCcw, TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — GreenLink ADM" }] }),
  component: Financeiro,
});

const statusVariant = (s: string) =>
  s === "pago" ? "default" : s === "vencido" ? "destructive" : "outline";

function Financeiro() {
  const { lancamentos, clientes, addLancamento, marcarPago, estornar } = useAppStore();

  // recalcula "vencido" sob demanda
  const lancs = useMemo(() => {
    const today = new Date();
    return lancamentos.map((l) => {
      if (l.status === "aberto" && new Date(l.vencimento) < today) return { ...l, status: "vencido" as const };
      return l;
    });
  }, [lancamentos]);

  const receber = lancs.filter((l) => l.tipo === "receber");
  const pagar = lancs.filter((l) => l.tipo === "pagar");
  const in30 = (d: string) => { const x = new Date(d); const t = new Date(); const lim = new Date(); lim.setDate(t.getDate() + 30); return x <= lim; };
  const totReceber30 = receber.filter((l) => l.status !== "pago" && in30(l.vencimento)).reduce((a, l) => a + l.valor, 0);
  const totPagar30 = pagar.filter((l) => l.status !== "pago" && in30(l.vencimento)).reduce((a, l) => a + l.valor, 0);
  const inadimplencia = receber.filter((l) => l.status === "vencido").reduce((a, l) => a + l.valor, 0);
  const saldoPrev = totReceber30 - totPagar30;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: "receber" as LancamentoTipo, descricao: "", clienteId: "", fornecedor: "",
    valor: "", vencimento: new Date().toISOString().slice(0, 10),
  });
  const submit = () => {
    if (!form.descricao || !form.valor) { toast.error("Preencha descrição e valor."); return; }
    addLancamento({
      tipo: form.tipo, descricao: form.descricao,
      clienteId: form.tipo === "receber" ? form.clienteId || undefined : undefined,
      fornecedor: form.tipo === "pagar" ? form.fornecedor : undefined,
      valor: Number(form.valor), vencimento: new Date(form.vencimento).toISOString(),
      origem: "manual",
    });
    toast.success("Lançamento criado.");
    setOpen(false);
    setForm({ tipo: "receber", descricao: "", clienteId: "", fornecedor: "", valor: "", vencimento: new Date().toISOString().slice(0, 10) });
  };

  return (
    <PageContainer>
      <PageHeader title="Financeiro" description="Contas a receber, a pagar e fluxo de caixa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo lançamento</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as LancamentoTipo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receber">A receber</SelectItem>
                      <SelectItem value="pagar">A pagar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                {form.tipo === "receber" ? (
                  <div><Label>Cliente</Label>
                    <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div><Label>Fornecedor</Label><Input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} /></div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Valor</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
                  <div><Label>Vencimento</Label><Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="A receber 30d" value={formatBRL(totReceber30)} icon={TrendingUp} accent="bg-success/10 text-success" />
        <Kpi label="A pagar 30d" value={formatBRL(totPagar30)} icon={TrendingDown} accent="bg-destructive/10 text-destructive" />
        <Kpi label="Inadimplência" value={formatBRL(inadimplencia)} icon={AlertCircle} accent="bg-warning/15 text-warning-foreground" />
        <Kpi label="Saldo previsto 30d" value={formatBRL(saldoPrev)} icon={Wallet} />
      </div>

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">A receber ({receber.length})</TabsTrigger>
          <TabsTrigger value="pagar">A pagar ({pagar.length})</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
        </TabsList>
        <TabsContent value="receber"><LancamentosTable items={receber} clientes={clientes} marcarPago={marcarPago} estornar={estornar} /></TabsContent>
        <TabsContent value="pagar"><LancamentosTable items={pagar} clientes={clientes} marcarPago={marcarPago} estornar={estornar} mostrarFornecedor /></TabsContent>
        <TabsContent value="fluxo">
          <FluxoCaixa lancs={lancs} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function Kpi({ label, value, icon: Icon, accent }: any) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${accent ?? "bg-primary/10 text-primary"}`}><Icon className="h-4 w-4" /></div>
      </div>
    </Card>
  );
}

function LancamentosTable({ items, clientes, marcarPago, estornar, mostrarFornecedor }: any) {
  return (
    <Card className="p-3 md:p-4">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>{mostrarFornecedor ? "Fornecedor" : "Cliente"}</TableHead>
          <TableHead>Vencimento</TableHead><TableHead>Valor</TableHead>
          <TableHead>Status</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {items.map((l: any) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.descricao}</TableCell>
              <TableCell className="text-muted-foreground">
                {mostrarFornecedor ? (l.fornecedor ?? "—") : (clientes.find((c: any) => c.id === l.clienteId)?.nome ?? "—")}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(l.vencimento)}</TableCell>
              <TableCell className="font-semibold">{formatBRL(l.valor)}</TableCell>
              <TableCell><Badge variant={statusVariant(l.status)}>{l.status}</Badge></TableCell>
              <TableCell className="text-right">
                {l.status !== "pago"
                  ? <Button size="sm" variant="outline" onClick={() => { marcarPago(l.id); toast.success("Marcado como pago."); }}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Pagar</Button>
                  : <Button size="sm" variant="ghost" onClick={() => estornar(l.id)}><RotateCcw className="h-3 w-3 mr-1" />Estornar</Button>}
              </TableCell>
            </TableRow>
          ))}
          {!items.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sem lançamentos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Card>
  );
}

function FluxoCaixa({ lancs }: { lancs: any[] }) {
  // agrupa por mês
  const buckets: Record<string, { rec: number; pag: number }> = {};
  for (let i = -1; i <= 5; i++) {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    buckets[d.toISOString().slice(0, 7)] = { rec: 0, pag: 0 };
  }
  for (const l of lancs) {
    if (l.status === "cancelado") continue;
    const k = l.vencimento.slice(0, 7);
    if (!buckets[k]) continue;
    if (l.tipo === "receber") buckets[k].rec += l.valor;
    else buckets[k].pag += l.valor;
  }
  const keys = Object.keys(buckets).sort();
  const max = Math.max(1, ...keys.map((k) => Math.max(buckets[k].rec, buckets[k].pag)));

  return (
    <Card className="p-5">
      <div className="grid grid-cols-7 gap-2">
        {keys.map((k) => {
          const b = buckets[k];
          const [y, m] = k.split("-");
          const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
          return (
            <div key={k} className="text-center">
              <div className="h-32 flex items-end justify-center gap-1">
                <div className="w-3 bg-success rounded-t" style={{ height: `${(b.rec / max) * 100}%` }} title={`Receber ${formatBRL(b.rec)}`} />
                <div className="w-3 bg-destructive rounded-t" style={{ height: `${(b.pag / max) * 100}%` }} title={`Pagar ${formatBRL(b.pag)}`} />
              </div>
              <p className="text-[10px] mt-1 uppercase">{label}</p>
              <p className="text-[10px] font-semibold">{formatBRL(b.rec - b.pag)}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-success" />Receber</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-destructive" />Pagar</span>
      </div>
    </Card>
  );
}
