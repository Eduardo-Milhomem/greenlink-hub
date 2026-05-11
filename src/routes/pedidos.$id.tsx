import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pedidos/$id")({
  head: () => ({ meta: [{ title: "Pedido — GreenLink ADM" }] }),
  component: PedidoDetalhe,
  notFoundComponent: () => <PageContainer><p className="text-muted-foreground">Pedido não encontrado.</p></PageContainer>,
});

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const { pedidos, clientes, orcamentos } = useAppStore();
  const p = pedidos.find((x) => x.id === id);
  if (!p) throw notFound();
  const orc = orcamentos.find((o) => o.id === p.orcamentoId);
  const cli = clientes.find((c) => c.id === p.clienteId);
  return (
    <PageContainer>
      <Link to="/pedidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Pedidos
      </Link>
      <PageHeader
        title={p.numero}
        description={`${cli?.nome ?? "—"} · ${formatDate(p.criadoEm)}`}
        actions={<Badge variant="outline">{p.status}</Badge>}
      />
      <Card className="p-5">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs uppercase text-muted-foreground">Cliente</p><p>{cli?.nome ?? "—"}</p></div>
          <div><p className="text-xs uppercase text-muted-foreground">Origem</p>
            {orc ? <Link to="/orcamentos/$id" params={{ id: orc.id }} className="text-primary hover:underline">{orc.numero}</Link> : "—"}
          </div>
          <div><p className="text-xs uppercase text-muted-foreground">Total</p><p className="text-lg font-bold">{formatBRL(p.total)}</p></div>
          <div><p className="text-xs uppercase text-muted-foreground">Itens</p><p>{orc?.itens.length ?? 0}</p></div>
        </div>
      </Card>
    </PageContainer>
  );
}
