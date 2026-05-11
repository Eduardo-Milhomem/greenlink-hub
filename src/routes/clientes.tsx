import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import type { ClienteTipo } from "@/lib/mock/types";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — GreenLink ADM" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { clientes, addCliente } = useAppStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<ClienteTipo>("pj");

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(q.toLowerCase()) ||
    c.documento?.toLowerCase().includes(q.toLowerCase()) ||
    c.email?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description={`${clientes.length} cadastrados`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  addCliente({
                    tipo,
                    nome: String(fd.get("nome")),
                    documento: String(fd.get("documento") || ""),
                    email: String(fd.get("email") || ""),
                    telefone: String(fd.get("telefone") || ""),
                    cidade: String(fd.get("cidade") || ""),
                    estado: String(fd.get("estado") || ""),
                  });
                  toast.success("Cliente cadastrado");
                  setOpen(false);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as ClienteTipo)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" /></div>
                  <div className="space-y-1.5"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" name="telefone" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label htmlFor="cidade">Cidade</Label><Input id="cidade" name="cidade" /></div>
                  <div className="space-y-1.5"><Label htmlFor="estado">UF</Label><Input id="estado" name="estado" maxLength={2} /></div>
                </div>
                <DialogFooter>
                  <Button type="submit">Cadastrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="pl-9 h-9" />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {filtered.map((c) => (
            <Link key={c.id} to="/clientes/$id" params={{ id: c.id }} className="block rounded-lg border p-3 hover:bg-muted">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.nome}</p>
                <Badge variant="outline" className="text-[10px] uppercase">{c.tipo}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{c.documento || "—"} · {c.cidade ?? "—"}</p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell><Link to="/clientes/$id" params={{ id: c.id }} className="font-medium hover:text-primary">{c.nome}</Link></TableCell>
                  <TableCell><Badge variant="outline" className="uppercase text-[10px]">{c.tipo}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.documento || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{[c.cidade, c.estado].filter(Boolean).join("/") || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.criadoEm)}</TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum cliente.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageContainer>
  );
}
