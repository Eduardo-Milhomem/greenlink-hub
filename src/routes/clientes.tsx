import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useRemoveCustomer,
  useQuotes,
  useOrders,
  useContracts,
  useReceivables,
  useRemoveQuote,
  useRemoveOrder,
  useRemoveContract,
  useRemoveReceivable,
} from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import type { CustomerType, Customer } from "@/types/customer";
import { Plus, Search, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — GreenLink ADM" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: quotes = [] } = useQuotes();
  const { data: orders = [] } = useOrders();
  const { data: contracts = [] } = useContracts();
  const { data: receivables = [] } = useReceivables();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const removeCustomer = useRemoveCustomer();
  const removeQuote = useRemoveQuote();
  const removeOrder = useRemoveOrder();
  const removeContract = useRemoveContract();
  const removeReceivable = useRemoveReceivable();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [tipo, setTipo] = useState<CustomerType>("pj");
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRelated, setDeleteRelated] = useState<{
    type: string;
    id: string;
    label: string;
  } | null>(null);
  const [deleteRelatedDialogOpen, setDeleteRelatedDialogOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.legalName.toLowerCase().includes(q.toLowerCase()) ||
      c.documentNumber?.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase()),
  );

  const getCustomerQuotes = (customerId: string) =>
    quotes.filter((q) => q.customerId === customerId);
  const getCustomerOrders = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId);
  const getCustomerContracts = (customerId: string) =>
    contracts.filter((c) => c.customerId === customerId);
  const getCustomerReceivables = (customerId: string) =>
    receivables.filter((r) => r.customerId === customerId);

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description={`${customers.length} cadastrados`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Novo cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo cliente</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const normalize = (value: FormDataEntryValue | null) => {
                    const s = (value ?? "").toString().trim();
                    return s.length ? s : undefined;
                  };
                  try {
                    await createCustomer.mutateAsync({
                      customerType: tipo,
                      legalName: String(fd.get("nome")),
                      documentNumber: normalize(fd.get("documento")),
                      email: normalize(fd.get("email")),
                      phone: normalize(fd.get("telefone")),
                      city: normalize(fd.get("cidade")),
                      state: normalize(fd.get("estado")),
                    });
                    toast.success("Cliente cadastrado");
                    setOpen(false);
                  } catch (err) {
                    console.error(err);
                    const e2 = err as { message?: string; code?: string };
                    let message = "Erro ao cadastrar cliente";
                    if (
                      e2.code === "42501" ||
                      (e2.message && e2.message.toLowerCase().includes("row-level security"))
                    ) {
                      message =
                        "Você não tem permissão para cadastrar clientes. Fale com um administrador para ajustar suas permissões.";
                    }
                    toast.error(message);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as CustomerType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                        <SelectItem value="pf">Pessoa Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="documento">{tipo === "pj" ? "CNPJ" : "CPF"}</Label>
                    <Input id="documento" name="documento" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">{tipo === "pj" ? "Razão social" : "Nome"}</Label>
                  <Input id="nome" name="nome" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" name="telefone" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" name="cidade" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="estado">UF</Label>
                    <Input id="estado" name="estado" maxLength={2} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCustomer.isPending}>
                    {createCustomer.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Cadastrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditCustomer(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          {editCustomer && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const normalize = (value: FormDataEntryValue | null) => {
                  const s = (value ?? "").toString().trim();
                  return s.length ? s : undefined;
                };
                try {
                  await updateCustomer.mutateAsync({
                    id: editCustomer.id,
                    data: {
                      customerType: editCustomer.customerType,
                      legalName: String(fd.get("nome")),
                      documentNumber: normalize(fd.get("documento")),
                      email: normalize(fd.get("email")),
                      phone: normalize(fd.get("telefone")),
                      city: normalize(fd.get("cidade")),
                      state: normalize(fd.get("estado")),
                      status: fd.get("status") === "true" ? "active" : "inactive",
                    },
                  });
                  toast.success("Cliente atualizado");
                  setEditOpen(false);
                  setEditCustomer(null);
                } catch (err) {
                  console.error(err);
                  const e2 = err as { message?: string; code?: string };
                  let message = "Erro ao atualizar cliente";
                  if (
                    e2.code === "42501" ||
                    (e2.message && e2.message.toLowerCase().includes("permission"))
                  ) {
                    message =
                      "Você não tem permissão para editar clientes. Fale com um administrador.";
                  }
                  toast.error(message);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Input
                    value={editCustomer.customerType === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{editCustomer.customerType === "pj" ? "CNPJ" : "CPF"}</Label>
                  <Input name="documento" defaultValue={editCustomer.documentNumber ?? ""} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Razão social / Nome</Label>
                <Input name="nome" defaultValue={editCustomer.legalName} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input name="email" type="email" defaultValue={editCustomer.email ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input name="telefone" defaultValue={editCustomer.phone ?? ""} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Cidade</Label>
                  <Input name="cidade" defaultValue={editCustomer.city ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>UF</Label>
                  <Input name="estado" maxLength={2} defaultValue={editCustomer.state ?? ""} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  name="status"
                  defaultValue={editCustomer.status === "active" ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 text-sm">Vínculos do cliente</h4>
                {(() => {
                  const clienteQuotes = getCustomerQuotes(editCustomer.id);
                  const clienteOrders = getCustomerOrders(editCustomer.id);
                  const clienteContracts = getCustomerContracts(editCustomer.id);
                  const clienteReceivables = getCustomerReceivables(editCustomer.id);
                  if (
                    clienteQuotes.length === 0 &&
                    clienteOrders.length === 0 &&
                    clienteContracts.length === 0 &&
                    clienteReceivables.length === 0
                  ) {
                    return (
                      <p className="text-sm text-muted-foreground">Sem vínculos registrados.</p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {clienteQuotes.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Orçamentos</p>
                          {clienteQuotes.map((q) => (
                            <div key={q.id} className="flex items-center justify-between py-1">
                              <span className="text-sm">{q.quoteNumber}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteRelated({
                                    type: "quote",
                                    id: q.id,
                                    label: q.quoteNumber,
                                  });
                                  setDeleteRelatedDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {clienteOrders.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Pedidos</p>
                          {clienteOrders.map((o) => (
                            <div key={o.id} className="flex items-center justify-between py-1">
                              <span className="text-sm">{o.orderNumber}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteRelated({
                                    type: "order",
                                    id: o.id,
                                    label: o.orderNumber,
                                  });
                                  setDeleteRelatedDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {clienteContracts.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Contratos</p>
                          {clienteContracts.map((c) => (
                            <div key={c.id} className="flex items-center justify-between py-1">
                              <span className="text-sm">{c.contractNumber}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteRelated({
                                    type: "contract",
                                    id: c.id,
                                    label: c.contractNumber,
                                  });
                                  setDeleteRelatedDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {clienteReceivables.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Lançamentos</p>
                          {clienteReceivables.map((r) => (
                            <div key={r.id} className="flex items-center justify-between py-1">
                              <span className="text-sm">
                                {r.description} ({r.status})
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteRelated({
                                    type: "receivable",
                                    id: r.id,
                                    label: r.description,
                                  });
                                  setDeleteRelatedDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setDeleteCustomerId(editCustomer.id);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={updateCustomer.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setEditCustomer(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateCustomer.isPending}>
                  {updateCustomer.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(v) => {
          setDeleteDialogOpen(v);
          if (!v) setDeleteCustomerId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e
              removerá todos os dados associados (contatos, endereços, histórico).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCustomerId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteCustomerId) return;
                try {
                  await removeCustomer.mutateAsync(deleteCustomerId);
                  toast.success("Cliente excluído");
                  setDeleteDialogOpen(false);
                  setDeleteCustomerId(null);
                  navigate({ to: "/clientes" });
                } catch (err) {
                  console.error(err);
                  const e = err as { message?: string; code?: string };
                  let message = "Erro ao excluir cliente";
                  if (e.code === "42501") {
                    message = "Sem permissão para excluir clientes.";
                  } else if (e.code === "23503") {
                    message =
                      "Cliente possui vínculos. Remova primeiro orçamentos, pedidos, contratos ou lançamentos.";
                  }
                  toast.error(message);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeCustomer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteRelatedDialogOpen}
        onOpenChange={(v) => {
          setDeleteRelatedDialogOpen(v);
          if (!v) setDeleteRelated(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vínculo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteRelated?.label}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRelated(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteRelated) return;
                try {
                  if (deleteRelated.type === "quote")
                    await removeQuote.mutateAsync(deleteRelated.id);
                  else if (deleteRelated.type === "order")
                    await removeOrder.mutateAsync(deleteRelated.id);
                  else if (deleteRelated.type === "contract")
                    await removeContract.mutateAsync(deleteRelated.id);
                  else if (deleteRelated.type === "receivable")
                    await removeReceivable.mutateAsync(deleteRelated.id);
                  toast.success("Vínculo excluído");
                  setDeleteRelatedDialogOpen(false);
                  setDeleteRelated(null);
                } catch (err) {
                  console.error(err);
                  toast.error("Erro ao excluir vínculo");
                  setDeleteRelatedDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {(removeQuote.isPending ||
                removeOrder.isPending ||
                removeContract.isPending ||
                removeReceivable.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to="/clientes/$id"
                  params={{ id: c.id }}
                  className="block rounded-lg border p-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{c.legalName}</p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {c.customerType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.documentNumber || "—"} · {c.city ?? "—"}
                  </p>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Cadastrado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          to="/clientes/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:text-primary"
                        >
                          {c.legalName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px]">
                          {c.customerType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.documentNumber || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[c.city, c.state].filter(Boolean).join("/") || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditCustomer(c);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum cliente.
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
