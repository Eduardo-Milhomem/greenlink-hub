import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatBRL, formatDate, calcOrcamentoTotal } from "@/lib/mock/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/clientes/$id")({
  head: () => ({ meta: [{ title: "Cliente — GreenLink ADM" }] }),
  component: ClienteDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Cliente não encontrado. <Link to="/clientes" className="text-primary">Voltar</Link></p>
    </PageContainer>
  ),
});

function ClienteDetalhe() {
  const { id } = Route.useParams();
  const { clientes, oportunidades, orcamentos } = useAppStore();
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) throw notFound();

  const opps = oportunidades.filter((o) => o.clienteId === cliente.id);
  const orcs = orcamentos.filter((o) => o.clienteId === cliente.id);

  return (
    <PageContainer>
      <Link to="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>
      <PageHeader
        title={cliente.nome}
        description={cliente.documento ?? cliente.email ?? "—"}
        actions={<Badge variant="outline" className="uppercase text-[10px]">{cliente.tipo}</Badge>}
      />

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="contatos">Contatos ({cliente.contatos.length})</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades ({opps.length})</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos ({orcs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <Card className="p-5 grid gap-3 sm:grid-cols-2">
            <Field label="E-mail" value={cliente.email} />
            <Field label="Telefone" value={cliente.telefone} />
            <Field label="Cidade" value={cliente.cidade} />
            <Field label="UF" value={cliente.estado} />
            <Field label="Endereço" value={cliente.endereco} className="sm:col-span-2" />
            <Field label="Cadastrado em" value={formatDate(cliente.criadoEm)} />
          </Card>
        </TabsContent>

        <TabsContent value="contatos">
          <Card className="p-5">
            {cliente.contatos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem contatos.</p>
            ) : (
              <ul className="divide-y">
                {cliente.contatos.map((c) => (
                  <li key={c.id} className="py-3 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">{c.cargo ?? "—"} · {c.email ?? "—"} · {c.telefone ?? "—"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="oportunidades">
          <Card className="p-5 space-y-2">
            {opps.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{o.titulo}</p>
                  <p className="text-xs text-muted-foreground">{o.estagio}</p>
                </div>
                <p className="font-semibold">{formatBRL(o.valor)}</p>
              </div>
            ))}
            {!opps.length && <p className="text-sm text-muted-foreground">Nenhuma oportunidade.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <Card className="p-5 space-y-2">
            {orcs.map((o) => (
              <Link key={o.id} to="/orcamentos/$id" params={{ id: o.id }} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
                <div>
                  <p className="font-medium">{o.numero}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.criadoEm)} · {o.status}</p>
                </div>
                <p className="font-semibold">{formatBRL(calcOrcamentoTotal(o))}</p>
              </Link>
            ))}
            {!orcs.length && <p className="text-sm text-muted-foreground">Nenhum orçamento.</p>}
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function Field({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value || "—"}</p>
    </div>
  );
}
