import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useAppStore, formatDate } from "@/lib/mock/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ativos/$id")({
  head: () => ({ meta: [{ title: "Ativo — GreenLink ADM" }] }),
  component: AtivoDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Ativo não encontrado.</p>
    </PageContainer>
  ),
});

function AtivoDetalhe() {
  const { id } = Route.useParams();
  const { ativos, clientes, ordens, tickets, contratos } = useAppStore();
  const a = ativos.find((x) => x.id === id);
  if (!a) throw notFound();
  const cli = clientes.find((c) => c.id === a.clienteId);
  const historico = ordens.filter((o) => o.ativosIds.includes(a.id));
  const ticketsRel = tickets.filter((t) => historico.some((o) => o.ticketId === t.id));
  const contratoRel = contratos.find(
    (c) => c.clienteId === a.clienteId && c.status === "ativo",
  );

  return (
    <PageContainer>
      <Link
        to="/ativos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ativos
      </Link>
      <PageHeader
        title={a.tag}
        description={[a.modelo, cli?.nome].filter(Boolean).join(" · ")}
        actions={<Badge variant="outline">{a.status}</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Dados</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Tag" value={a.tag} />
            <Info label="Status" value={<Badge>{a.status}</Badge>} />
            <Info label="Modelo" value={a.modelo} />
            <Info label="Tipo" value={a.tipo} />
            <Info
              label="Cliente"
              value={
                cli ? (
                  <Link
                    to="/clientes/$id"
                    params={{ id: cli.id }}
                    className="text-primary hover:underline"
                  >
                    {cli.nome}
                  </Link>
                ) : (
                  "Sem cliente"
                )
              }
            />
            <Info label="Localização" value={a.localizacao ?? "—"} />
            <Info label="Instalado em" value={formatDate(a.instaladoEm)} />
            <Info label="Última leitura" value={formatDate(a.ultimaLeitura)} />
            <Info
              label="Contrato vigente"
              value={
                contratoRel ? (
                  <Link
                    to="/contratos/$id"
                    params={{ id: contratoRel.id }}
                    className="text-primary hover:underline"
                  >
                    {contratoRel.numero}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Linha do tempo</h3>
            <ol className="relative border-l ml-2 space-y-3">
              {[
                a.instaladoEm && { d: a.instaladoEm, label: "Instalado" },
                ...historico.map((o) => ({
                  d: o.criadoEm,
                  label: `OS ${o.numero}: ${o.titulo}`,
                })),
                a.ultimaLeitura && { d: a.ultimaLeitura, label: "Última leitura" },
              ]
                .filter(Boolean)
                .sort((x: any, y: any) => (x.d < y.d ? 1 : -1))
                .map((e: any, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground">{formatDate(e.d)}</p>
                    <p className="text-sm">{e.label}</p>
                  </li>
                ))}
            </ol>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Histórico de OS</h2>
            <div className="space-y-2 text-sm">
              {historico.slice(0, 8).map((o) => (
                <Link
                  key={o.id}
                  to="/os/$id"
                  params={{ id: o.id }}
                  className="block rounded-md border p-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{o.numero}</span>
                    <Badge variant="outline">{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{o.titulo}</p>
                </Link>
              ))}
              {!historico.length && (
                <p className="text-sm text-muted-foreground">Nenhuma OS vinculada.</p>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Tickets relacionados</h2>
            <div className="space-y-2 text-sm">
              {ticketsRel.slice(0, 8).map((t) => (
                <Link
                  key={t.id}
                  to="/suporte/$id"
                  params={{ id: t.id }}
                  className="block rounded-md border p-3 hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.numero}</span>
                    <Badge variant="outline">{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.assunto}</p>
                </Link>
              ))}
              {!ticketsRel.length && (
                <p className="text-sm text-muted-foreground">Sem tickets vinculados.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
