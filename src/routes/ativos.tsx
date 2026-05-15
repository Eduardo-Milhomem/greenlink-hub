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
import {
  useAssets,
  useCreateAsset,
  useCustomers,
  useServiceOrders,
  useUpdateAsset,
} from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import type { AssetStatus } from "@/types/asset";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ativos")({
  head: () => ({ meta: [{ title: "Ativos — GreenLink ADM" }] }),
  component: AtivosPage,
});

function AtivosPage() {
  const { data: ativos = [] } = useAssets();
  const { data: clientes = [] } = useCustomers();
  const { data: ordens = [] } = useServiceOrders();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tag: "",
    modelo: "",
    tipo: "Sensor",
    clienteId: "",
    localizacao: "",
    status: "ativo" as "ativo" | "manutencao" | "baixado",
  });

  const statusToAssetStatus: Record<typeof form.status, AssetStatus> = {
    ativo: "installed",
    manutencao: "maintenance",
    baixado: "inactive",
  };

  const assetStatusToUi: Partial<Record<AssetStatus, typeof form.status>> = {
    installed: "ativo",
    maintenance: "manutencao",
    inactive: "baixado",
    available: "ativo",
    reserved: "ativo",
    rented: "ativo",
    returned: "ativo",
  };

  const submit = async () => {
    if (!form.tag || !form.modelo) {
      toast.error("Preencha tag e modelo.");
      return;
    }
    try {
      await createAsset.mutateAsync({
        assetTag: form.tag,
        serialNumber: form.modelo,
        ownerType: "greenlink",
        customerId: form.clienteId || undefined,
        siteName: form.localizacao || undefined,
        status: statusToAssetStatus[form.status],
        notes: form.tipo ? `Tipo: ${form.tipo}` : undefined,
      });
      toast.success("Ativo cadastrado.");
      setOpen(false);
      setForm({
        tag: "",
        modelo: "",
        tipo: "Sensor",
        clienteId: "",
        localizacao: "",
        status: "ativo",
      });
    } catch (e) {
      toast.error("Erro ao cadastrar ativo.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ativos"
        description={`${ativos.length} equipamentos · ${ativos.filter((a) => a.status === "ativo").length} ativos`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo ativo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo ativo</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tag</Label>
                    <Input
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sensor">Sensor</SelectItem>
                        <SelectItem value="Gateway">Gateway</SelectItem>
                        <SelectItem value="Estação">Estação</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={form.modelo}
                    onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={form.clienteId}
                    onValueChange={(v) => setForm({ ...form, clienteId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input
                    value={form.localizacao}
                    onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                  />
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
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {ativos.map((a) => (
            <Link
              key={a.id}
              to="/ativos/$id"
              params={{ id: a.id }}
              className="block rounded-lg border p-3 hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{a.assetTag}</p>
                <Badge variant="outline">{assetStatusToUi[a.status] ?? a.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{a.serialNumber || "—"}</p>
              <p className="text-xs text-muted-foreground">
                {clientes.find((c) => c.id === a.customerId)?.legalName ?? "Sem cliente"} ·{" "}
                {a.siteName ?? "—"}
              </p>
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Última leitura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>OS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ativos.map((a) => {
                const osCount = ordens.filter((o) => o.assetId === a.id).length;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      <Link to="/ativos/$id" params={{ id: a.id }} className="hover:text-primary">
                        {a.assetTag}
                      </Link>
                    </TableCell>
                    <TableCell>{a.serialNumber || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.ownerType}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {clientes.find((c) => c.id === a.customerId)?.legalName ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.siteName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(a.lastReadingAt)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={assetStatusToUi[a.status] ?? "ativo"}
                        onValueChange={async (v: "ativo" | "manutencao" | "baixado") => {
                          try {
                            await updateAsset.mutateAsync({
                              id: a.id,
                              data: { status: statusToAssetStatus[v] },
                            });
                          } catch (e) {
                            toast.error("Erro ao atualizar status");
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="baixado">Baixado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{osCount}</TableCell>
                  </TableRow>
                );
              })}
              {!ativos.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum ativo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
