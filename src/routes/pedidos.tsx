import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useOrders, useCustomers } from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types/order";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Pedidos — GreenLink ADM" }] }),
  component: PedidosPage,
});

const statusColor: Record<OrderStatus, string> = {
  open: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  invoiced: "bg-accent text-accent-foreground",
  partially_fulfilled: "bg-warning/15 text-warning-foreground",
  fulfilled: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function PedidosPage() {
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();

  const isLoading = isLoadingOrders || isLoadingCustomers;

  return (
    <PageContainer>
      <PageHeader title="Pedidos" description={`${orders.length} pedidos`} />
      <Card className="p-3 md:p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-2">
              {orders.map((p) => (
                <Link
                  key={p.id}
                  to="/pedidos/$id"
                  params={{ id: p.id }}
                  className="block rounded-lg border p-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{p.orderNumber}</p>
                    <Badge className={statusColor[p.status]} variant="secondary">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customers.find((c) => c.id === p.customerId)?.legalName ?? "—"} ·{" "}
                    {formatDate(p.orderDate)}
                  </p>
                  <p className="font-semibold mt-1">{formatBRL(p.totalAmount)}</p>
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
                  {orders.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          to="/pedidos/$id"
                          params={{ id: p.id }}
                          className="font-medium hover:text-primary"
                        >
                          {p.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customers.find((c) => c.id === p.customerId)?.legalName ?? "—"}
                      </TableCell>
                      <TableCell className="font-semibold">{formatBRL(p.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[p.status]} variant="secondary">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(p.orderDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!orders.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum pedido. Aprove um orçamento para gerar um pedido.
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
