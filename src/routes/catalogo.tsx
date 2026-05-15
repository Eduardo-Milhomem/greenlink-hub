import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useCatalog, useCreateCatalogItem } from "@/hooks/domain";
import { formatBRL } from "@/lib/formatters";
import type { CatalogItemType } from "@/types/catalog";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/services";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo — GreenLink ADM" }] }),
  loader: async ({ context: { queryClient } }) => {
    try {
      return await queryClient.ensureQueryData({
        queryKey: ["catalog"],
        queryFn: services.catalog.list,
        revalidateIfStale: true,
      });
    } catch (error) {
      console.error("[CatalogLoader] Failed to prefetch catalog:", error);
      // Não lançamos erro aqui para evitar quebra catastrófica do SSR se o banco estiver offline.
      // O useQuery no componente lidará com o estado de erro se necessário.
      return [];
    }
  },
  component: CatalogoPage,
  errorComponent: ({ error }) => {
    console.error("[CatalogRouteError]", error);
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-lg font-semibold text-destructive">Erro no Catálogo</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {error instanceof Error ? error.message : "Não foi possível carregar os dados."}
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  },
});

function CatalogoPage() {
  const { data: catalogo = [], isLoading, isError, error } = useCatalog();
  const createCatalogItem = useCreateCatalogItem();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<CatalogItemType>("product");

  const tipoLabel: Record<CatalogItemType, string> = {
    product: "Produto",
    service: "Serviço",
    kit: "Kit",
    rental: "Locação",
    manufactured: "Fabricado",
  };

  if (isError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <h1 className="text-lg font-semibold text-destructive">Erro ao carregar dados</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {error instanceof Error ? error.message : "Ocorreu uma falha na conexão com o banco."}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Catálogo"
        description={`${catalogo.length} itens comercializaveis`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Novo item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo item</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    await createCatalogItem.mutateAsync({
                      itemCode: String(fd.get("codigo")),
                      name: String(fd.get("nome")),
                      itemType: tipo,
                      unitCode: String(fd.get("unidade") || "un"),
                      salePrice: Number(fd.get("preco") || 0),
                      isActive: true,
                    });
                    toast.success("Item adicionado");
                    setOpen(false);
                  } catch {
                    toast.error("Erro ao adicionar item");
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Código</Label>
                    <Input name="codigo" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as CatalogItemType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produto</SelectItem>
                        <SelectItem value="service">Servico</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input name="nome" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Unidade</Label>
                    <Input name="unidade" defaultValue="un" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preço</Label>
                    <Input name="preco" type="number" step="0.01" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCatalogItem.isPending}>
                    {createCatalogItem.isPending && (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    )}
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
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
              {catalogo.map((i) => (
                <div key={i.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{i.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {tipoLabel[i.itemType]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {i.itemCode} · {i.unitCode}
                  </p>
                  <p className="font-semibold mt-1">{formatBRL(i.salePrice)}</p>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Un.</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalogo.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.itemCode}</TableCell>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {tipoLabel[i.itemType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{i.unitCode}</TableCell>
                      <TableCell className="font-semibold">{formatBRL(i.salePrice)}</TableCell>
                      <TableCell>
                        {i.isActive ? (
                          <Badge className="bg-success/15 text-success" variant="secondary">
                            ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline">inativo</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </PageContainer>
  );
}
