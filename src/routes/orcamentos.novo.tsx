import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL } from "@/lib/mock/store";
import type { OrcamentoItem } from "@/lib/mock/types";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orcamentos/novo")({
  head: () => ({ meta: [{ title: "Novo orçamento — GreenLink ADM" }] }),
  component: NovoOrcamento,
});

function NovoOrcamento() {
  const navigate = useNavigate();
  const { clientes, catalogo, addOrcamento } = useAppStore();
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [observacao, setObservacao] = useState("");
  const [novoItemId, setNovoItemId] = useState(catalogo[0]?.id ?? "");

  const subtotal = itens.reduce((a, i) => a + i.quantidade * i.precoUnit - i.desconto, 0);
  const total = Math.max(0, subtotal - desconto);

  const adicionar = () => {
    const it = catalogo.find((i) => i.id === novoItemId);
    if (!it) return;
    setItens((arr) => [...arr, { itemId: it.id, codigo: it.codigo, nome: it.nome, quantidade: 1, precoUnit: it.preco, desconto: 0 }]);
  };

  const salvar = (status: "rascunho" | "enviado") => {
    if (!clienteId || !itens.length) {
      toast.error("Selecione um cliente e adicione pelo menos um item.");
      return;
    }
    const novo = addOrcamento({ clienteId, itens, desconto, observacao, status });
    toast.success(`Orçamento ${novo.numero} criado`);
    navigate({ to: "/orcamentos/$id", params: { id: novo.id } });
  };

  return (
    <PageContainer>
      <Link to="/orcamentos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Orçamentos
      </Link>
      <PageHeader title="Novo orçamento" description="Monte o orçamento a partir do catálogo." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-2">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <div className="flex items-end gap-2 p-3 border-b bg-muted/30">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Adicionar do catálogo</Label>
                <Select value={novoItemId} onValueChange={setNovoItemId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {catalogo.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.codigo} — {i.nome} ({formatBRL(i.preco)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={adicionar}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-24">Qtd</TableHead>
                    <TableHead className="w-32">Preço</TableHead>
                    <TableHead className="w-32">Desc.</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <p className="font-medium text-sm">{it.nome}</p>
                        <p className="text-xs text-muted-foreground">{it.codigo}</p>
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} value={it.quantidade}
                          onChange={(e) => setItens((arr) => arr.map((x, i) => i === idx ? { ...x, quantidade: Number(e.target.value) } : x))} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} step="0.01" value={it.precoUnit}
                          onChange={(e) => setItens((arr) => arr.map((x, i) => i === idx ? { ...x, precoUnit: Number(e.target.value) } : x))} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} step="0.01" value={it.desconto}
                          onChange={(e) => setItens((arr) => arr.map((x, i) => i === idx ? { ...x, desconto: Number(e.target.value) } : x))} />
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(it.quantidade * it.precoUnit - it.desconto)}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => setItens((arr) => arr.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!itens.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-sm">Nenhum item adicionado.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observação</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border bg-background p-2 text-sm"
              value={observacao} onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-4 space-y-3 h-fit lg:sticky lg:top-20">
          <h3 className="font-semibold">Resumo</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">Desconto</span>
              <Input type="number" min={0} step="0.01" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className="w-28 h-8 text-right" />
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold"><span>Total</span><span>{formatBRL(total)}</span></div>
          </div>
          <div className="grid gap-2">
            <Button onClick={() => salvar("enviado")}>Salvar e enviar</Button>
            <Button variant="outline" onClick={() => salvar("rascunho")}>Salvar como rascunho</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
