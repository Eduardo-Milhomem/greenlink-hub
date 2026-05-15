import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useContracts, useCustomers, useCreateContract } from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import type { ContractType, BillingFrequency, ContractStatus } from "@/types/contract";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos")({
  head: () => ({ meta: [{ title: "Contratos — GreenLink ADM" }] }),
  component: ContratosPage,
});

const CONTRATO_TIPO_LABEL: Record<ContractType, string> = {
  sale_installation: "Venda + instalação",
  rental: "Locação",
  subscription: "Assinatura",
  support: "Suporte",
  mixed: "Misto",
};

const CONTRATO_FREQUENCIA_LABEL: Record<BillingFrequency, string> = {
  one_time: "Pagamento único",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const statusVariant = (s: ContractStatus) =>
  s === "active" ? "default" : s === "suspended" ? "secondary" : "outline";

function ContratosPage() {
  const { data: contracts = [], isLoading: isLoadingContracts } = useContracts();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const createContract = useCreateContract();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    monthlyAmount: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    priceIndexer: "fixo",
    contractType: "subscription" as ContractType,
    billingFrequency: "monthly" as BillingFrequency,
    notes: "",
  });

  const isLoading = isLoadingContracts || isLoadingCustomers;

  const submit = async () => {
    if (!form.customerId || !form.monthlyAmount || !form.endDate) {
      toast.error("Preencha cliente, valor mensal e vigência.");
      return;
    }
    try {
      await createContract.mutateAsync({
        customerId: form.customerId,
        monthlyAmount: Number(form.monthlyAmount),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        priceIndexer: form.priceIndexer,
        contractType: form.contractType,
        billingFrequency: form.billingFrequency,
        notes: form.notes,
        status: "active",
        contractNumber: `CTR-${Math.floor(Math.random() * 10000)}`,
        autoRenew: false,
      });
      toast.success("Contrato criado.");
      setOpen(false);
      setForm({
        customerId: "",
        monthlyAmount: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        priceIndexer: "fixo",
        contractType: "subscription",
        billingFrequency: "monthly",
        notes: "",
      });
    } catch (err) {
      toast.error("Erro ao criar contrato.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Contratos"
        description={`${contracts.length} contratos · ${formatBRL(contracts.filter((c) => c.status === "active").reduce((a, c) => a + c.monthlyAmount, 0))}/mês ativo`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo contrato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo contrato</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Início</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor mensal</Label>
                    <Input
                      type="number"
                      value={form.monthlyAmount}
                      onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Indexador</Label>
                    <Select
                      value={form.priceIndexer}
                      onValueChange={(v) => setForm({ ...form, priceIndexer: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixo">Fixo</SelectItem>
                        <SelectItem value="ipca">IPCA</SelectItem>
                        <SelectItem value="igpm">IGPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={form.contractType}
                      onValueChange={(v) => setForm({ ...form, contractType: v as ContractType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CONTRATO_TIPO_LABEL) as ContractType[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {CONTRATO_TIPO_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequência</Label>
                    <Select
                      value={form.billingFrequency}
                      onValueChange={(v) =>
                        setForm({ ...form, billingFrequency: v as BillingFrequency })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CONTRATO_FREQUENCIA_LABEL) as BillingFrequency[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {CONTRATO_FREQUENCIA_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit} disabled={createContract.isPending}>
                  {createContract.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              {contracts.map((c) => {
                const cli = customers.find((x) => x.id === c.customerId);
                return (
                  <Link
                    key={c.id}
                    to="/contratos/$id"
                    params={{ id: c.id }}
                    className="block rounded-lg border p-3 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{c.contractNumber}</p>
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cli?.legalName} · {CONTRATO_TIPO_LABEL[c.contractType]} ·{" "}
                      {CONTRATO_FREQUENCIA_LABEL[c.billingFrequency || "monthly"]}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatBRL(c.monthlyAmount)}/mês</p>
                    <p className="text-xs text-muted-foreground">
                      Até {c.endDate ? formatDate(c.endDate) : "—"}
                    </p>
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Mensal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          to="/contratos/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:text-primary"
                        >
                          {c.contractNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customers.find((x) => x.id === c.customerId)?.legalName ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {CONTRATO_TIPO_LABEL[c.contractType]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {CONTRATO_FREQUENCIA_LABEL[c.billingFrequency || "monthly"]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(c.startDate)} → {c.endDate ? formatDate(c.endDate) : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">{formatBRL(c.monthlyAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!contracts.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum contrato.
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
