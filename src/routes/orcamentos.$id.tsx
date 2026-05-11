import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate, calcOrcamentoTotal } from "@/lib/mock/store";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orcamentos/$id")({
  head: () => ({ meta: [{ title: "Orçamento — GreenLink ADM" }] }),
  component: OrcDetalhe,
  notFoundComponent: () => (
    <PageContainer><p className="text-muted-foreground">Orçamento não encontrado.</p></PageContainer>
  ),
});

function OrcDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { orcamentos, clientes, updateOrcamento, aprovarOrcamento } = useAppStore();
  const o = orcamentos.find((x) => x.id === id);
  if (!o) throw notFound();
  const cli = clientes.find((c) => c.id === o.clienteId);
  const total = calcOrcamentoTotal(o);
  const subtotal = o.itens.reduce((a, i) => a + i.quantidade * i.precoUnit - i.desconto, 0);

  return (
    <PageContainer>
      <Link to="/orcamentos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Orçamentos
      </Link>
      <PageHeader
        title={o.numero}
        description={`${cli?.nome ?? "—"} · ${formatDate(o.criadoEm)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">{o.status}</Badge>
            {o.status !== "convertido" && o.status !== "aprovado" && (
              <Button variant="outline" onClick={() => { updateOrcamento(o.id, { status: "recusado" }); toast.message("Marcado como recusado"); }}>
                <XCircle className="h-4 w-4 mr-1" /> Recusar
              </Button>
            )}
            {o.status !== "convertido" && (
              <Button onClick={() => { const p = aprovarOrcamento(o.id); if (p) { toast.success(`Pedido ${p.numero} criado`); navigate({ to: "/pedidos/$id", params: { id: p.id } }); } }}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar e gerar pedido
              </Button>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Desc.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {o.itens.map((it, i) => (
                <TableRow key={i}>
                  <TableCell><p className="font-medium text-sm">{it.nome}</p><p className="text-xs text-muted-foreground">{it.codigo}</p></TableCell>
                  <TableCell>{it.quantidade}</TableCell>
                  <TableCell>{formatBRL(it.precoUnit)}</TableCell>
                  <TableCell>{formatBRL(it.desconto)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(it.quantidade * it.precoUnit - it.desconto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {o.observacao && (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Observação</p>
              {o.observacao}
            </div>
          )}
        </Card>
        <Card className="p-4 space-y-1 text-sm h-fit">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>{formatBRL(o.desconto)}</span></div>
          <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold"><span>Total</span><span>{formatBRL(total)}</span></div>
        </Card>
      </div>
    </PageContainer>
  );
}
