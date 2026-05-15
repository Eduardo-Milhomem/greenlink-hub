import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  useReceivables,
  usePayables,
  useCustomers,
  useReceivePayment,
  useCreateReceivable,
  useCreatePayable,
} from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import {
  Plus,
  CheckCircle2,
  RotateCcw,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { BillingStatus } from "@/types/contract";
import type { Receivable, Payable } from "@/types/finance";
import type { Customer } from "@/types/customer";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — GreenLink ADM" }] }),
  component: Financeiro,
});

const statusVariant = (s: BillingStatus) =>
  s === "paid"
    ? "default"
    : s === "overdue"
      ? "destructive"
      : s === "partial"
        ? "secondary"
        : "outline";

const statusLabel: Record<BillingStatus, string> = {
  open: "Aberto",
  partial: "Parcial",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

function Financeiro() {
  const { data: receivables = [], isLoading: isLoadingReceivables } = useReceivables();
  const { data: payables = [], isLoading: isLoadingPayables } = usePayables();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const receivePayment = useReceivePayment();
  const createReceivable = useCreateReceivable();
  const createPayable = useCreatePayable();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: "receber",
    description: "",
    customerId: "",
    amount: "",
    dueDate: new Date().toISOString().slice(0, 10),
  });

  const isLoading = isLoadingReceivables || isLoadingPayables || isLoadingCustomers;

  const in30 = (d: string) => {
    const x = new Date(d);
    const t = new Date();
    const lim = new Date();
    lim.setDate(t.getDate() + 30);
    return x <= lim;
  };

  const totReceber30 = receivables
    .filter((l) => l.status !== "paid" && in30(l.dueDate))
    .reduce((a, l) => a + l.openAmount, 0);
  const totPagar30 = payables
    .filter((l) => l.status !== "paid" && in30(l.dueDate))
    .reduce((a, l) => a + l.openAmount, 0);
  const inadimplencia = receivables
    .filter((l) => l.status === "overdue")
    .reduce((a, l) => a + l.openAmount, 0);
  const saldoPrev = totReceber30 - totPagar30;

  const submit = async () => {
    if (!form.description.trim()) {
      toast.error("Informe a descrição do lançamento.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }
    if (!form.dueDate) {
      toast.error("Informe a data de vencimento.");
      return;
    }
    if (form.tipo === "receber" && !form.customerId) {
      toast.error("Selecione o cliente.");
      return;
    }

    try {
      if (form.tipo === "receber") {
        await createReceivable.mutateAsync({
          description: form.description.trim(),
          customerId: form.customerId,
          amount: Number(form.amount),
          dueDate: form.dueDate,
          status: "open",
        });
        toast.success("Conta a receber criada com sucesso!");
      } else {
        await createPayable.mutateAsync({
          description: form.description.trim(),
          amount: Number(form.amount),
          dueDate: form.dueDate,
          status: "open",
        });
        toast.success("Conta a pagar criada com sucesso!");
      }
      setForm({
        tipo: form.tipo,
        description: "",
        customerId: "",
        amount: "",
        dueDate: new Date().toISOString().slice(0, 10),
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      const e = err as { message?: string; code?: string };
      let message = "Erro ao criar lançamento.";
      if (
        e.code === "42501" ||
        (e.message && e.message.toLowerCase().includes("permission denied"))
      ) {
        message = "Você não tem permissão para criar lançamentos. Fale com um administrador.";
      } else if (e.code === "23503") {
        message = "Dados inválidos. Verifique se o cliente está correto.";
      }
      toast.error(message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Financeiro"
        description="Contas a receber, a pagar e fluxo de caixa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo lançamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receber">A receber</SelectItem>
                      <SelectItem value="pagar">A pagar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                {form.tipo === "receber" && (
                  <div>
                    <Label>Cliente</Label>
                    <Select
                      value={form.customerId}
                      onValueChange={(v) => setForm({ ...form, customerId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.legalName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi
          label="A receber 30d"
          value={formatBRL(totReceber30)}
          icon={TrendingUp}
          accent="bg-success/10 text-success"
        />
        <Kpi
          label="A pagar 30d"
          value={formatBRL(totPagar30)}
          icon={TrendingDown}
          accent="bg-destructive/10 text-destructive"
        />
        <Kpi
          label="Inadimplência"
          value={formatBRL(inadimplencia)}
          icon={AlertCircle}
          accent="bg-warning/15 text-warning-foreground"
        />
        <Kpi label="Saldo previsto 30d" value={formatBRL(saldoPrev)} icon={Wallet} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="receber">
          <TabsList>
            <TabsTrigger value="receber">A receber ({receivables.length})</TabsTrigger>
            <TabsTrigger value="pagar">A pagar ({payables.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="receber">
            <LancamentosTable
              items={receivables}
              customers={customers}
              onAction={async (l) => {
                try {
                  await receivePayment.mutateAsync({ id: l.id, amount: l.openAmount });
                  toast.success("Recebimento registrado.");
                } catch (err) {
                  toast.error("Erro ao registrar.");
                }
              }}
              actionLabel="Registrar recebimento"
              ActionIcon={HandCoins}
              isPending={receivePayment.isPending}
            />
          </TabsContent>
          <TabsContent value="pagar">
            <LancamentosTable
              items={payables}
              customers={[]}
              onAction={() => toast.info("Pagamento em breve")}
              actionLabel="Pagar"
              ActionIcon={CheckCircle2}
              showSupplier
            />
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl ${accent ?? "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function LancamentosTable<T extends Receivable | Payable>({
  items,
  customers,
  onAction,
  actionLabel,
  ActionIcon,
  showSupplier,
  isPending,
}: {
  items: T[];
  customers: Customer[];
  onAction: (l: T) => void;
  actionLabel: string;
  ActionIcon: LucideIcon;
  showSupplier?: boolean;
  isPending?: boolean;
}) {
  return (
    <Card className="p-3 md:p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>{showSupplier ? "Fornecedor" : "Cliente"}</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {showSupplier
                  ? "supplierId" in l
                    ? (l.supplierId ?? "—")
                    : "—"
                  : "customerId" in l
                    ? (customers.find((c) => c.id === l.customerId)?.legalName ?? "—")
                    : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(l.dueDate)}</TableCell>
              <TableCell className="font-semibold">
                {formatBRL(l.amount)}
                {l.openAmount < l.amount ? (
                  <span className="block text-[10px] font-normal text-muted-foreground">
                    Aberto: {formatBRL(l.openAmount)}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(l.status)}>{statusLabel[l.status]}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {l.status !== "paid" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(l)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <ActionIcon className="h-3 w-3 mr-1" />
                    )}
                    {actionLabel}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Estornar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {!items.length && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Sem lançamentos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
