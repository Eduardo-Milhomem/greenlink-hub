import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useQuotes, useCustomers } from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import { Plus, Loader2 } from "lucide-react";
import type { QuoteStatus } from "@/types/quote";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({ meta: [{ title: "Orçamentos — GreenLink ADM" }] }),
  component: OrcamentosPage,
});

const statusColor: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  expired: "bg-warning/15 text-warning-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrcamentosPage() {
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuotes();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();

  const isLoading = isLoadingQuotes || isLoadingCustomers;

  return (
    <PageContainer>
      <PageHeader
        title="Orçamentos"
        description={`${quotes.length} no total`}
        actions={
          <Button asChild>
            <Link to="/orcamentos/novo">
              <Plus className="h-4 w-4 mr-1" />
              Novo orçamento
            </Link>
          </Button>
        }
      />
      <Card className="p-3 md:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-2">
              {quotes.map((o) => {
                const cli = customers.find((c) => c.id === o.customerId);
                return (
                  <Link
                    key={o.id}
                    to="/orcamentos/$id"
                    params={{ id: o.id }}
                    className="block rounded-lg border p-3 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{o.quoteNumber}</p>
                      <Badge className={statusColor[o.status]} variant="secondary">
                        {o.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cli?.legalName} · {formatDate(o.createdAt)}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatBRL(o.totalAmount)}</p>
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
                  {quotes.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <Link
                          to="/orcamentos/$id"
                          params={{ id: o.id }}
                          className="font-medium hover:text-primary"
                        >
                          {o.quoteNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customers.find((c) => c.id === o.customerId)?.legalName ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{o.items.length}</TableCell>
                      <TableCell className="font-semibold">{formatBRL(o.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[o.status]} variant="secondary">
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!quotes.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum orçamento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
