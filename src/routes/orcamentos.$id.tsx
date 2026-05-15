import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import {
  useQuote,
  useCustomer,
  useApproveQuote,
  useGenerateOrder,
  useUpdateQuote,
} from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import { ArrowLeft, CheckCircle2, XCircle, Send, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { QuoteStatus } from "@/types/quote";

export const Route = createFileRoute("/orcamentos/$id")({
  head: () => ({ meta: [{ title: "Orçamento — GreenLink ADM" }] }),
  component: OrcDetalhe,
});

const statusColor: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/15 text-primary",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  expired: "bg-warning/15 text-warning-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

function OrcDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: o, isLoading: isLoadingQuote } = useQuote(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(o?.customerId);
  const approveQuote = useApproveQuote();
  const generateOrder = useGenerateOrder();
  const updateQuote = useUpdateQuote();

  const isLoading = isLoadingQuote || isLoadingCustomer;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!o) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Orçamento não encontrado.</p>
      </PageContainer>
    );
  }

  const subtotal = o.items.reduce((a, i) => a + i.totalAmount, 0);

  return (
    <PageContainer>
      <Link
        to="/orcamentos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Orçamentos
      </Link>
      <PageHeader
        title={o.quoteNumber}
        description={`${cli?.legalName ?? "—"} · ${formatDate(o.createdAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColor[o.status]} variant="secondary">
              {o.status}
            </Badge>
            {o.status === "draft" && (
              <Button
                variant="outline"
                disabled={updateQuote.isPending}
                onClick={async () => {
                  try {
                    await updateQuote.mutateAsync({ id: o.id, data: { status: "sent" } });
                    toast.success("Orçamento enviado ao cliente.");
                  } catch (err) {
                    toast.error("Erro ao enviar orçamento.");
                  }
                }}
              >
                {updateQuote.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Enviar
              </Button>
            )}
            {(o.status === "draft" || o.status === "sent") && (
              <>
                <Button
                  variant="outline"
                  disabled={updateQuote.isPending}
                  onClick={async () => {
                    try {
                      await updateQuote.mutateAsync({ id: o.id, data: { status: "rejected" } });
                      toast.message("Orçamento marcado como recusado.");
                    } catch (err) {
                      toast.error("Erro ao recusar orçamento.");
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Recusar
                </Button>
                <Button
                  disabled={approveQuote.isPending}
                  onClick={async () => {
                    if (!o.items.length) {
                      toast.error("Adicione pelo menos um item antes de aprovar.");
                      return;
                    }
                    try {
                      await approveQuote.mutateAsync(o.id);
                      toast.success("Orçamento aprovado.");
                    } catch (err) {
                      toast.error("Erro ao aprovar orçamento.");
                    }
                  }}
                >
                  {approveQuote.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Aprovar
                </Button>
              </>
            )}
            {o.status === "approved" && (
              <Button
                disabled={generateOrder.isPending}
                onClick={async () => {
                  try {
                    await generateOrder.mutateAsync(o.id);
                    toast.success(`Pedido criado com sucesso.`);
                    navigate({ to: "/pedidos" });
                  } catch (err) {
                    toast.error("Erro ao gerar pedido.");
                  }
                }}
              >
                {generateOrder.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4 mr-1" />
                )}
                Gerar pedido
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
              {o.items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <p className="font-medium text-sm">{it.itemDescription}</p>
                    <p className="text-xs text-muted-foreground">{it.catalogItemId}</p>
                  </TableCell>
                  <TableCell>{it.quantity}</TableCell>
                  <TableCell>{formatBRL(it.unitPrice)}</TableCell>
                  <TableCell>{formatBRL(it.discountAmount)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRL(it.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {o.notes && (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Observação
              </p>
              {o.notes}
            </div>
          )}
        </Card>
        <Card className="p-4 space-y-1 text-sm h-fit">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desconto</span>
            <span>{formatBRL(o.discountAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatBRL(o.totalAmount)}</span>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
