import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  useContract,
  useCustomer,
  useReceivables,
  useBillContract,
  useCreateServiceOrder,
  useContractItems,
  useAddContractItems,
  useCatalog,
} from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
import {
  ArrowLeft,
  FileSignature,
  PauseCircle,
  Wrench,
  Loader2,
  Plus,
  Trash2,
  Boxes,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ContractType, BillingFrequency, ContractItem } from "@/types/contract";

export const Route = createFileRoute("/contratos/$id")({
  head: () => ({ meta: [{ title: "Contrato — GreenLink ADM" }] }),
  component: Detalhe,
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

function Detalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: ct, isLoading: isLoadingContract } = useContract(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(ct?.customerId);
  const { data: receivables = [], isLoading: isLoadingReceivables } = useReceivables();
  const { data: items = [], isLoading: isLoadingItems } = useContractItems(id);
  const { data: catalog = [] } = useCatalog();

  const billContract = useBillContract();
  const createServiceOrder = useCreateServiceOrder();
  const addItems = useAddContractItems();

  const [selectedCatalogId, setSelectedCatalogId] = useState("");

  const isLoading =
    isLoadingContract || isLoadingCustomer || isLoadingReceivables || isLoadingItems;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!ct) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Contrato não encontrado.</p>
      </PageContainer>
    );
  }

  const faturas = receivables.filter((l) => l.contractId === ct.id);

  const handleAddItem = async () => {
    const it = catalog.find((c) => c.id === selectedCatalogId);
    if (!it) return;

    try {
      const newItem: ContractItem = {
        id: `tmp-${Date.now()}`,
        contractId: ct.id,
        catalogItemId: it.id,
        description: it.name,
        quantity: 1,
        unitPrice: it.salePrice,
        isRecurring: true,
      };
      await addItems.mutateAsync({
        contractId: ct.id,
        items: [newItem],
      });
      toast.success("Item adicionado ao contrato.");
    } catch (err) {
      toast.error("Erro ao adicionar item.");
    }
  };

  return (
    <PageContainer>
      <Link
        to="/contratos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Contratos
      </Link>
      <PageHeader
        title={ct.contractNumber}
        description={`${cli?.legalName ?? "—"} · ${ct.notes ?? ""}`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button
              disabled={billContract.isPending}
              onClick={async () => {
                try {
                  await billContract.mutateAsync(ct.id);
                  toast.success("Fatura gerada no financeiro.");
                } catch (err) {
                  toast.error("Erro ao gerar fatura.");
                }
              }}
            >
              {billContract.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSignature className="h-4 w-4 mr-2" />
              )}
              Gerar fatura
            </Button>
            <Button
              variant="outline"
              disabled={createServiceOrder.isPending}
              onClick={async () => {
                try {
                  await createServiceOrder.mutateAsync({
                    osNumber: `OS-${Math.floor(Math.random() * 10000)}`,
                    description: `Atendimento — ${ct.contractNumber}`,
                    customerId: ct.customerId,
                    priority: "medium",
                    contractId: ct.id,
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

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold mb-4">Dados do Contrato</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info label="Cliente" value={cli?.legalName ?? "—"} />
              <Info label="Status" value={<Badge>{ct.status}</Badge>} />
              <Info label="Tipo" value={CONTRATO_TIPO_LABEL[ct.contractType]} />
              <Info
                label="Frequência"
                value={CONTRATO_FREQUENCIA_LABEL[ct.billingFrequency || "monthly"]}
              />
              <Info label="Início" value={formatDate(ct.startDate)} />
              <Info label="Fim" value={ct.endDate ? formatDate(ct.endDate) : "—"} />
              <Info
                label="Valor mensal"
                value={<span className="font-semibold">{formatBRL(ct.monthlyAmount)}</span>}
              />
              <Info label="Indexador" value={ct.priceIndexer?.toUpperCase() || "FIXO"} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Itens e Ativos Recorrentes</h2>
              <div className="flex gap-2">
                <Select value={selectedCatalogId} onValueChange={setSelectedCatalogId}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="Adicionar do catálogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8" onClick={handleAddItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Unitário</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it, idx) => (
                    <TableRow key={`${it.id}-${idx}`}>
                      <TableCell className="text-sm">{it.description}</TableCell>
                      <TableCell className="text-sm">{it.quantity}</TableCell>
                      <TableCell className="text-sm">{formatBRL(it.unitPrice)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatBRL(it.quantity * it.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-sm text-muted-foreground"
                      >
                        Nenhum item recorrente vinculado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Faturas Geradas</h2>
            <ul className="space-y-2 text-sm">
              {faturas.length ? (
                faturas.map((f) => (
                  <li key={f.id} className="flex justify-between border-b pb-2 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDate(f.dueDate)}</span>
                      <span className="text-[10px] text-muted-foreground">{f.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-semibold">{formatBRL(f.amount)}</span>
                      <Badge variant="outline" className="text-[9px] h-4">
                        {f.status}
                      </Badge>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-2">Sem faturas geradas.</p>
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Ativos Vinculados</h2>
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Boxes className="h-3.5 w-3.5 mr-1" /> Gerir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Equipamentos instalados sob este contrato.
            </p>
            {/* Listagem de ativos seria aqui */}
            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              Clique em Gerir para associar equipamentos.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground font-medium mb-0.5">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
