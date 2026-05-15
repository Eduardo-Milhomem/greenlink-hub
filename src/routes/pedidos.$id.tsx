import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useOrder,
  useCustomer,
  useQuote,
  useCreateServiceOrder,
  useUpdateOrderStatus,
} from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@/types/order";

export const Route = createFileRoute("/pedidos/$id")({
  head: () => ({ meta: [{ title: "Pedido — GreenLink ADM" }] }),
  component: PedidoDetalhe,
});

const ORDER_STATUS_LIST: { id: OrderStatus; label: string }[] = [
  { id: "open", label: "Aberto" },
  { id: "approved", label: "Aprovado" },
  { id: "invoiced", label: "Faturado" },
  { id: "partially_fulfilled", label: "Parcialmente atendido" },
  { id: "fulfilled", label: "Atendido" },
  { id: "cancelled", label: "Cancelado" },
];

const statusColor: Record<OrderStatus, string> = {
  open: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  invoiced: "bg-accent text-accent-foreground",
  partially_fulfilled: "bg-warning/15 text-warning-foreground",
  fulfilled: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: p, isLoading: isLoadingOrder } = useOrder(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(p?.customerId);
  const { data: orc, isLoading: isLoadingQuote } = useQuote(p?.quoteId);
  const createServiceOrder = useCreateServiceOrder();
  const updateStatus = useUpdateOrderStatus();

  const isLoading = isLoadingOrder || isLoadingCustomer || isLoadingQuote;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!p) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Pedido não encontrado.</p>
      </PageContainer>
    );
  }

  const itens = p.items || [];

  return (
    <PageContainer>
      <Link
        to="/pedidos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Pedidos
      </Link>
      <PageHeader
        title={p.orderNumber}
        description={`${cli?.legalName ?? "—"} · ${formatDate(p.orderDate)}`}
        actions={
          <div className="flex gap-2 flex-wrap items-center">
            <Select
              value={p.status}
              onValueChange={async (v) => {
                try {
                  await updateStatus.mutateAsync({ id: p.id, status: v });
                  toast.success("Status do pedido atualizado.");
                } catch (err) {
                  toast.error("Erro ao atualizar status.");
                }
              }}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="w-[200px]">
                {updateStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_LIST.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={createServiceOrder.isPending}
              onClick={async () => {
                try {
                  await createServiceOrder.mutateAsync({
                    osNumber: `OS-${Math.floor(Math.random() * 10000)}`, // Mock number
                    description: `Instalação/atendimento — ${p.orderNumber}`,
                    customerId: p.customerId,
                    priority: "medium",
                    orderId: p.id,
                  });
                  toast.success(`OS criada com sucesso.`);
                  navigate({ to: "/os" });
                } catch (err) {
                  toast.error("Erro ao criar OS.");
                }
              }}
            >
              {createServiceOrder.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wrench className="h-4 w-4 mr-2" />
              )}
              Criar OS
            </Button>
          </div>
        }
      />
      <Card className="p-5">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Cliente</p>
            <p>{cli?.legalName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Origem (orçamento)</p>
            {orc ? (
              <Link
                to="/orcamentos/$id"
                params={{ id: orc.id }}
                className="text-primary hover:underline"
              >
                {orc.quoteNumber}
              </Link>
            ) : (
              "—"
            )}
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatBRL(p.totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Itens</p>
            <p>{itens.length}</p>
          </div>
        </div>
        {itens.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Itens do pedido (snapshot)
            </p>
            <ul className="divide-y text-sm">
              {itens.map((it, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span>
                    <span className="font-medium">{it.description}</span>{" "}
                    <span className="text-muted-foreground text-xs">({it.catalogItemId})</span>
                  </span>
                  <span className="text-muted-foreground">
                    {it.quantity} × {formatBRL(it.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
