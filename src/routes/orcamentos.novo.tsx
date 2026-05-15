import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useCustomers, useCatalog, useCreateQuote } from "@/hooks/domain";
import { formatBRL } from "@/lib/formatters";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { QuoteItem } from "@/types/quote";

export const Route = createFileRoute("/orcamentos/novo")({
  head: () => ({ meta: [{ title: "Novo orçamento — GreenLink ADM" }] }),
  component: NovoOrcamento,
});

function NovoOrcamento() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: catalog = [], isLoading: isLoadingCatalog } = useCatalog();
  const createQuote = useCreateQuote();

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Partial<QuoteItem>[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");

  // Set default selection when data loads
  useEffect(() => {
    if (customers.length && !customerId) setCustomerId(customers[0].id);
    if (catalog.length && !selectedCatalogItemId) setSelectedCatalogItemId(catalog[0].id);
  }, [customers, catalog, customerId, selectedCatalogItemId]);

  const subtotal = items.reduce((a, i) => a + (i.totalAmount || 0), 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const addItem = () => {
    const it = catalog.find((i) => i.id === selectedCatalogItemId);
    if (!it) return;

    setItems((arr) => [
      ...arr,
      {
        catalogItemId: it.id,
        itemDescription: it.name,
        quantity: 1,
        unitPrice: it.salePrice,
        discountAmount: 0,
        totalAmount: it.salePrice,
        itemType: it.itemType,
      },
    ]);
  };

  const updateItem = (idx: number, updates: Partial<QuoteItem>) => {
    setItems((arr) =>
      arr.map((item, i) => {
        if (i !== idx) return item;
        const newItem = { ...item, ...updates };
        // Recalculate total for this item
        const qty = newItem.quantity || 0;
        const price = newItem.unitPrice || 0;
        const disc = newItem.discountAmount || 0;
        newItem.totalAmount = qty * price - disc;
        return newItem;
      }),
    );
  };

  const handleSave = async (status: "draft" | "sent") => {
    if (!customerId || !items.length) {
      toast.error("Selecione um cliente e adicione pelo menos um item.");
      return;
    }

    try {
      await createQuote.mutateAsync({
        customerId,
        status,
        notes,
        discountAmount,
        quoteNumber: `ORC-${Math.floor(Math.random() * 10000)}`,
        items: items as QuoteItem[],
        subtotal,
        totalAmount,
        issueDate: new Date().toISOString(),
      });
      toast.success("Orçamento criado com sucesso.");
      navigate({ to: "/orcamentos" });
    } catch (err) {
      toast.error("Erro ao criar orçamento.");
    }
  };

  const isLoading = isLoadingCustomers || isLoadingCatalog;

  return (
    <PageContainer>
      <Link
        to="/orcamentos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Orçamentos
      </Link>
      <PageHeader title="Novo orçamento" description="Monte o orçamento a partir do catálogo." />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-4 space-y-3 lg:col-span-2">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
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

            <div className="rounded-lg border overflow-hidden">
              <div className="flex items-end gap-2 p-3 border-b bg-muted/30">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Adicionar do catálogo</Label>
                  <Select value={selectedCatalogItemId} onValueChange={setSelectedCatalogItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um item" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.itemCode} — {i.name} ({formatBRL(i.salePrice)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-24">Qtd</TableHead>
                      <TableHead className="w-32">Preço</TableHead>
                      <TableHead className="w-32">Desc. Item</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <p className="font-medium text-sm">{it.itemDescription}</p>
                          <p className="text-xs text-muted-foreground">{it.catalogItemId}</p>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={it.unitPrice}
                            onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={it.discountAmount}
                            onChange={(e) =>
                              updateItem(idx, { discountAmount: Number(e.target.value) })
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatBRL(it.totalAmount || 0)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!items.length && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-6 text-sm"
                        >
                          Nenhum item adicionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observação</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border bg-background p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionais para o cliente..."
              />
            </div>
          </Card>

          <Card className="p-4 space-y-3 h-fit lg:sticky lg:top-20">
            <h3 className="font-semibold border-b pb-2">Resumo do Orçamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Desconto Global</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
                    R$
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-28 h-8 text-right pl-6"
                  />
                </div>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold text-primary">
                <span>Total Final</span>
                <span>{formatBRL(totalAmount)}</span>
              </div>
            </div>
            <div className="grid gap-2 pt-2">
              <Button
                onClick={() => handleSave("sent")}
                disabled={createQuote.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createQuote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar e Enviar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={createQuote.isPending}
              >
                Salvar como Rascunho
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
