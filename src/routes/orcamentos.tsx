import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate, calcOrcamentoTotal } from "@/lib/mock/store";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({ meta: [{ title: "Orçamentos — GreenLink ADM" }] }),
  component: OrcamentosPage,
});

const statusColor: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  enviado: "bg-primary/15 text-primary",
  aprovado: "bg-success/15 text-success",
  recusado: "bg-destructive/15 text-destructive",
  convertido: "bg-accent text-accent-foreground",
};

function OrcamentosPage() {
  const { orcamentos, clientes } = useAppStore();
  return (
    <PageContainer>
      <PageHeader
        title="Orçamentos"
        description={`${orcamentos.length} no total`}
        actions={
          <Button asChild>
            <Link to="/orcamentos/novo"><Plus className="h-4 w-4 mr-1" />Novo orçamento</Link>
          </Button>
        }
      />
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {orcamentos.map((o) => {
            const cli = clientes.find((c) => c.id === o.clienteId);
            return (
              <Link key={o.id} to="/orcamentos/$id" params={{ id: o.id }} className="block rounded-lg border p-3 hover:bg-muted">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{o.numero}</p>
                  <Badge className={statusColor[o.status]} variant="secondary">{o.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{cli?.nome} · {formatDate(o.criadoEm)}</p>
                <p className="text-sm font-semibold mt-1">{formatBRL(calcOrcamentoTotal(o))}</p>
              </Link>
            );
          })}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.map((o) => (
                <TableRow key={o.id}>
                  <TableCell><Link to="/orcamentos/$id" params={{ id: o.id }} className="font-medium hover:text-primary">{o.numero}</Link></TableCell>
                  <TableCell className="text-muted-foreground">{clientes.find((c) => c.id === o.clienteId)?.nome ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{o.itens.length}</TableCell>
                  <TableCell className="font-semibold">{formatBRL(calcOrcamentoTotal(o))}</TableCell>
                  <TableCell><Badge className={statusColor[o.status]} variant="secondary">{o.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(o.criadoEm)}</TableCell>
                </TableRow>
              ))}
              {!orcamentos.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum orçamento.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
