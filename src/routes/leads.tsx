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
import { useLeads, useCreateLead, useUpdateLead, useConvertLead } from "@/hooks/domain";
import { formatDate } from "@/lib/formatters";
import type { LeadStatus } from "@/types/lead";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/leads")({
  head: () => ({ meta: [{ title: "Leads — GreenLink ADM" }] }),
  component: LeadsPage,
});

const statusColor: Record<LeadStatus, string> = {
  novo: "bg-primary/15 text-primary",
  contatado: "bg-warning/15 text-warning-foreground",
  qualificado: "bg-success/15 text-success",
  perdido: "bg-destructive/15 text-destructive",
  convertido: "bg-muted text-muted-foreground",
};

function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const convertLead = useConvertLead();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("site");

  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description={`${leads.length} leads`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Novo lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo lead</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    await createLead.mutateAsync({
                      name: String(fd.get("nome")),
                      companyName: String(fd.get("empresa") || "") || undefined,
                      email: String(fd.get("email") || "") || undefined,
                      phone: String(fd.get("telefone") || "") || undefined,
                      source,
                    });
                    toast.success("Lead adicionado");
                    setOpen(false);
                  } catch (err) {
                    toast.error("Erro ao adicionar lead");
                  }
                }}
              >
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input name="nome" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Empresa (opcional)</Label>
                  <Input name="empresa" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input name="email" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input name="telefone" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Origem</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="ads">Anúncio</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createLead.isPending}>
                    {createLead.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
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
              {leads.map((l) => (
                <div key={l.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{l.name}</p>
                    <Badge className={statusColor[l.status]} variant="secondary">
                      {l.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {l.companyName ?? "—"} · {l.source}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLead.mutate({ id: l.id, data: { status: "contatado" } })}
                      disabled={updateLead.isPending}
                    >
                      Contatado
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => convertLead.mutate({ id: l.id })}
                      disabled={convertLead.isPending}
                    >
                      Converter <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.companyName ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.email ?? l.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {l.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[l.status]} variant="secondary">
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(l.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => convertLead.mutate({ id: l.id })}
                          disabled={convertLead.isPending}
                        >
                          {convertLead.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Converter"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!leads.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum lead.
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
