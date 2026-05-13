import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useAppStore,
  formatBRL,
  formatDate,
  calcOrcamentoTotal,
  visualLancamentoStatus,
} from "@/lib/mock/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/clientes/$id")({
  head: () => ({ meta: [{ title: "Cliente — GreenLink ADM" }] }),
  component: ClienteDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">
        Cliente não encontrado.{" "}
        <Link to="/clientes" className="text-primary">
          Voltar
        </Link>
      </p>
    </PageContainer>
  ),
});

function ClienteDetalhe() {
  const { id } = Route.useParams();
  const {
    clientes,
    oportunidades,
    orcamentos,
    pedidos,
    contratos,
    ordens,
    tickets,
    ativos,
    lancamentos,
  } = useAppStore();
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) throw notFound();

  const opps = oportunidades.filter((o) => o.clienteId === cliente.id);
  const orcs = orcamentos.filter((o) => o.clienteId === cliente.id);
  const peds = pedidos.filter((p) => p.clienteId === cliente.id);
  const ctrs = contratos.filter((c) => c.clienteId === cliente.id);
  const oss = ordens.filter((o) => o.clienteId === cliente.id);
  const tks = tickets.filter((t) => t.clienteId === cliente.id);
  const ats = ativos.filter((a) => a.clienteId === cliente.id);
  const lcts = lancamentos.filter((l) => l.clienteId === cliente.id);
  const aReceber = lcts
    .filter((l) => l.tipo === "receber" && l.status !== "pago" && l.status !== "cancelado")
    .reduce((a, l) => a + (l.valor - (l.valorPago ?? 0)), 0);
  const recebido = lcts
    .filter((l) => l.tipo === "receber" && l.status === "pago")
    .reduce((a, l) => a + l.valor, 0);

  // Timeline: junta tudo ordenado por data desc
  type Evt = { d: string; label: string; href?: string };
  const eventos: Evt[] = [
    { d: cliente.criadoEm, label: "Cliente cadastrado" },
    ...opps.map((o) => ({ d: o.criadoEm, label: `Oportunidade: ${o.titulo}` })),
    ...orcs.map((o) => ({
      d: o.criadoEm,
      label: `Orçamento ${o.numero} (${o.status})`,
      href: `/orcamentos/${o.id}`,
    })),
    ...peds.map((p) => ({
      d: p.criadoEm,
      label: `Pedido ${p.numero} (${p.status})`,
      href: `/pedidos/${p.id}`,
    })),
    ...ctrs.map((c) => ({
      d: c.criadoEm,
      label: `Contrato ${c.numero}`,
      href: `/contratos/${c.id}`,
    })),
    ...oss.map((o) => ({
      d: o.criadoEm,
      label: `OS ${o.numero}: ${o.titulo}`,
      href: `/os/${o.id}`,
    })),
    ...tks.map((t) => ({
      d: t.criadoEm,
      label: `Ticket ${t.numero}: ${t.assunto}`,
      href: `/suporte/${t.id}`,
    })),
  ].sort((a, b) => (a.d < b.d ? 1 : -1));

  return (
    <PageContainer>
      <Link
        to="/clientes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Clientes
      </Link>
      <PageHeader
        title={cliente.nome}
        description={cliente.documento ?? cliente.email ?? "—"}
        actions={
          <Badge variant="outline" className="uppercase text-[10px]">
            {cliente.tipo}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiMini label="Oportunidades" value={String(opps.length)} />
        <KpiMini label="Pedidos" value={String(peds.length)} />
        <KpiMini label="A receber" value={formatBRL(aReceber)} accent="text-warning" />
        <KpiMini label="Recebido" value={formatBRL(recebido)} accent="text-success" />
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="contatos">Contatos ({cliente.contatos.length})</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades ({opps.length})</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos ({orcs.length})</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos ({peds.length})</TabsTrigger>
          <TabsTrigger value="contratos">Contratos ({ctrs.length})</TabsTrigger>
          <TabsTrigger value="ativos">Ativos ({ats.length})</TabsTrigger>
          <TabsTrigger value="os">OS ({oss.length})</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tks.length})</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
                      <p className="text-xs text-muted-foreground">
                        {c.cargo ?? "—"} · {c.email ?? "—"} · {c.telefone ?? "—"}
                      </p>
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
              <Link
                key={o.id}
                to="/orcamentos/$id"
                params={{ id: o.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{o.numero}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.criadoEm)} · {o.status}
                  </p>
                </div>
                <p className="font-semibold">{formatBRL(calcOrcamentoTotal(o))}</p>
              </Link>
            ))}
            {!orcs.length && <p className="text-sm text-muted-foreground">Nenhum orçamento.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="pedidos">
          <Card className="p-5 space-y-2">
            {peds.map((p) => (
              <Link
                key={p.id}
                to="/pedidos/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{p.numero}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.criadoEm)} · {p.status}
                  </p>
                </div>
                <p className="font-semibold">{formatBRL(p.total)}</p>
              </Link>
            ))}
            {!peds.length && <p className="text-sm text-muted-foreground">Nenhum pedido.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="contratos">
          <Card className="p-5 space-y-2">
            {ctrs.map((c) => (
              <Link
                key={c.id}
                to="/contratos/$id"
                params={{ id: c.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{c.numero}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.tipo} · {c.frequencia} · {c.status}
                  </p>
                </div>
                <p className="font-semibold">{formatBRL(c.valorMensal)}</p>
              </Link>
            ))}
            {!ctrs.length && <p className="text-sm text-muted-foreground">Nenhum contrato.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="ativos">
          <Card className="p-5 space-y-2">
            {ats.map((a) => (
              <Link
                key={a.id}
                to="/ativos/$id"
                params={{ id: a.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{a.tag}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.modelo} · {a.localizacao ?? "—"}
                  </p>
                </div>
                <Badge variant="outline">{a.status}</Badge>
              </Link>
            ))}
            {!ats.length && <p className="text-sm text-muted-foreground">Nenhum ativo.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="os">
          <Card className="p-5 space-y-2">
            {oss.map((o) => (
              <Link
                key={o.id}
                to="/os/$id"
                params={{ id: o.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">
                    {o.numero} — {o.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.tecnico ?? "Sem técnico"} · {formatDate(o.criadoEm)}
                  </p>
                </div>
                <Badge variant="outline">{o.status}</Badge>
              </Link>
            ))}
            {!oss.length && <p className="text-sm text-muted-foreground">Nenhuma OS.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="p-5 space-y-2">
            {tks.map((t) => (
              <Link
                key={t.id}
                to="/suporte/$id"
                params={{ id: t.id }}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium">
                    {t.numero} — {t.assunto}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.canal} · {t.prioridade}
                  </p>
                </div>
                <Badge variant="outline">{t.status}</Badge>
              </Link>
            ))}
            {!tks.length && <p className="text-sm text-muted-foreground">Nenhum ticket.</p>}
          </Card>
        </TabsContent>

        <TabsContent value="financeiro">
          <Card className="p-5 space-y-2">
            {lcts.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{l.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence {formatDate(l.vencimento)} · {visualLancamentoStatus(l)}
                  </p>
                </div>
                <p className="font-semibold">{formatBRL(l.valor)}</p>
              </div>
            ))}
            {!lcts.length && (
              <p className="text-sm text-muted-foreground">Nenhum lançamento financeiro.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-5">
            <ol className="relative border-l ml-2 space-y-4">
              {eventos.map((e, i) => (
                <li key={i} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">{formatDate(e.d)}</p>
                  {e.href ? (
                    <a href={e.href} className="text-sm hover:text-primary">
                      {e.label}
                    </a>
                  ) : (
                    <p className="text-sm">{e.label}</p>
                  )}
                </li>
              ))}
            </ol>
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

function KpiMini({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${accent ?? ""}`}>{value}</p>
    </Card>
  );
}
