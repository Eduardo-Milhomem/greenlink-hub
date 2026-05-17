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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { formatDate } from "@/lib/formatters";
import {
  useCatalog,
  useInventoryMovements,
  useServiceOrders,
  useAddStockMovement,
  useUpdateMinimumStock,
} from "@/hooks/domain";
import type { StockMovementType } from "@/types/inventory";
import { Plus, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/estoque")({
  head: () => ({ meta: [{ title: "Estoque — GreenLink ADM" }] }),
  component: EstoquePage,
});

const ESTOQUE_MIN_DEFAULT = 10;
const minimoOf = (i: { trackStock?: boolean }) => ESTOQUE_MIN_DEFAULT; // Mock

function calcEstoque(itemId: string, movements: StockMovement[]) {
  return movements
    .filter((m) => m.catalogItemId === itemId)
    .reduce((acc, m) => {
      if (m.movementType === "in" || m.movementType === "production_in") return acc + m.quantity;
      if (m.movementType === "out" || m.movementType === "consumption") return acc - m.quantity;
      return acc;
    }, 0);
}

function EstoquePage() {
  const { data: catalogo = [], isLoading: isLoadingCatalog } = useCatalog();
  const { data: movimentacoes = [], isLoading: isLoadingMovements } = useInventoryMovements();
  const { data: ordens = [], isLoading: isLoadingOrders } = useServiceOrders();
  const addMovement = useAddStockMovement();
  const updateMinStock = useUpdateMinimumStock();

  const produtos = catalogo.filter((i) => i.itemType !== "service");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    itemId: "",
    tipo: "in" as StockMovementType,
    quantidade: "",
    motivo: "",
    osId: "",
  });

  const isLoading = isLoadingCatalog || isLoadingMovements || isLoadingOrders;

  const submit = async () => {
    if (!form.itemId || !form.quantidade) {
      toast.error("Preencha item e quantidade.");
      return;
    }
    const qty = Number(form.quantidade);
    if (qty <= 0) {
      toast.error("Quantidade deve ser maior que zero.");
      return;
    }
    try {
      await addMovement.mutateAsync({
        catalogItemId: form.itemId,
        movementType: form.tipo,
        quantity: qty,
        notes: form.motivo || null,
        referenceType: form.osId ? "service_order" : null,
        referenceId: form.osId || null,
      });
      toast.success("Movimentação registrada.");
      setOpen(false);
      setForm({ itemId: "", tipo: "in", quantidade: "", motivo: "", osId: "" });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar movimentação.");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  const criticos = produtos.filter((i) => calcEstoque(i.id, movimentacoes) < minimoOf(i));

  return (
    <PageContainer>
      <PageHeader
        title="Estoque"
        description={`${produtos.length} itens · ${criticos.length} abaixo do mínimo`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Item</Label>
                  <Select
                    value={form.itemId}
                    onValueChange={(v) => setForm({ ...form, itemId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.itemCode} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={form.tipo}
                      onValueChange={(v) => setForm({ ...form, tipo: v as StockMovementType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Saída</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                        <SelectItem value="reservation">Reserva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={form.quantidade}
                      onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                    />
                  </div>
                </div>
                {(form.tipo === "out" || form.tipo === "reservation") && (
                  <div>
                    <Label>Vincular à OS (opcional)</Label>
                    <Select value={form.osId} onValueChange={(v) => setForm({ ...form, osId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem OS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem OS</SelectItem>
                        {ordens.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.osNumber} — {o.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Motivo</Label>
                  <Input
                    value={form.motivo}
                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={submit} disabled={addMovement.isPending}>
                  {addMovement.isPending ? "Registrando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="saldos">
        <TabsList>
          <TabsTrigger value="saldos">Saldos</TabsTrigger>
          <TabsTrigger value="movs">Movimentações</TabsTrigger>
        </TabsList>
        <TabsContent value="saldos">
          <Card className="p-3 md:p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((p) => {
                  const saldo = calcEstoque(p.id, movimentacoes);
                  const min = minimoOf(p);
                  const critico = saldo < min;
                  return (
                    <TableRow key={p.id} className={critico ? "bg-destructive/5" : undefined}>
                      <TableCell className="font-mono text-xs">{p.itemCode}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.unitCode}</TableCell>
                      <TableCell className="font-semibold">{saldo}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={min}
                          className="h-7 w-20"
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val !== min) {
                              updateMinStock.mutate(
                                { catalogItemId: p.id, minimumStock: val },
                                {
                                  onSuccess: () => toast.success("Estoque mínimo atualizado"),
                                  onError: () => toast.error("Erro ao atualizar mínimo"),
                                },
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {critico ? (
                          <Badge variant="destructive" className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Crítico
                          </Badge>
                        ) : (
                          <Badge variant="outline">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="movs">
          <Card className="p-3 md:p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentacoes.map((m) => {
                  const item = catalogo.find((c) => c.id === m.catalogItemId);
                  const os = m.referenceId ? ordens.find((o) => o.id === m.referenceId) : undefined;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(m.occurredAt)}
                      </TableCell>
                      <TableCell>
                        {item?.itemCode} — {item?.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.movementType}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{m.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {[m.notes, os ? os.osNumber : undefined].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!movimentacoes.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Sem movimentações.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
