import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL } from "@/lib/mock/store";
import type { ItemTipo } from "@/lib/mock/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo — GreenLink ADM" }] }),
  component: CatalogoPage,
});

function CatalogoPage() {
  const { catalogo, addItemCatalogo } = useAppStore();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<ItemTipo>("produto");

  return (
    <PageContainer>
      <PageHeader
        title="Catálogo"
        description="Produtos, serviços e kits comercializáveis."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Novo item</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo item</DialogTitle></DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addItemCatalogo({
                    codigo: String(fd.get("codigo")),
                    nome: String(fd.get("nome")),
                    tipo,
                    unidade: String(fd.get("unidade") || "un"),
                    preco: Number(fd.get("preco") || 0),
                    ativo: true,
                  });
                  toast.success("Item adicionado");
                  setOpen(false);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Código</Label><Input name="codigo" required /></div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as ItemTipo)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Nome</Label><Input name="nome" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Unidade</Label><Input name="unidade" defaultValue="un" /></div>
                  <div className="space-y-1.5"><Label>Preço</Label><Input name="preco" type="number" step="0.01" required /></div>
                </div>
                <DialogFooter><Button type="submit">Adicionar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="p-3 md:p-4">
        <div className="md:hidden space-y-2">
          {catalogo.map((i) => (
            <div key={i.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{i.nome}</p>
                <Badge variant="outline" className="text-[10px]">{i.tipo}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{i.codigo} · {i.unidade}</p>
              <p className="font-semibold mt-1">{formatBRL(i.preco)}</p>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Un.</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogo.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.codigo}</TableCell>
                  <TableCell className="font-medium">{i.nome}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{i.tipo}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{i.unidade}</TableCell>
                  <TableCell className="font-semibold">{formatBRL(i.preco)}</TableCell>
                  <TableCell>{i.ativo ? <Badge className="bg-success/15 text-success" variant="secondary">ativo</Badge> : <Badge variant="outline">inativo</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
