import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate } from "@/lib/mock/store";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — GreenLink ADM" }] }),
  component: PedidosPage,
});

function PedidosPage() {
  const { pedidos, clientes } = useAppStore();
  return (
    <PageContainer>
      <PageHeader title="Pedidos" description={`${pedidos.length} pedidos`} />
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {pedidos.map((p) => (
            <Link key={p.id} to="/pedidos/$id" params={{ id: p.id }} className="block rounded-lg border p-3 hover:bg-muted">
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.numero}</p>
                <Badge variant="outline">{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{clientes.find((c) => c.id === p.clienteId)?.nome ?? "—"} · {formatDate(p.criadoEm)}</p>
              <p className="font-semibold mt-1">{formatBRL(p.total)}</p>
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Link to="/pedidos/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.numero}</Link></TableCell>
                  <TableCell className="text-muted-foreground">{clientes.find((c) => c.id === p.clienteId)?.nome ?? "—"}</TableCell>
                  <TableCell className="font-semibold">{formatBRL(p.total)}</TableCell>
                  <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.criadoEm)}</TableCell>
                </TableRow>
              ))}
              {!pedidos.length && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum pedido. Aprove um orçamento para gerar um pedido.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
