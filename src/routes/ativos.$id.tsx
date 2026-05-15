import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { formatDate } from "@/lib/formatters";
import { useAsset, useCustomer, useServiceOrders, useTickets, useContracts } from "@/hooks/domain";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/ativos/$id")({
  head: () => ({ meta: [{ title: "Ativo — GreenLink ADM" }] }),
  component: AtivoDetalhe,
  notFoundComponent: () => (
    <PageContainer>
      <p className="text-muted-foreground">Ativo não encontrado.</p>
    </PageContainer>
  ),
});

type TimelineEntry = { d: string; label: string };

function AtivoDetalhe() {
  const { id } = Route.useParams();
  const { data: a, isLoading: isLoadingAsset } = useAsset(id);
  const { data: cli, isLoading: isLoadingCustomer } = useCustomer(a?.customerId);
  const { data: ordens = [], isLoading: isLoadingOrders } = useServiceOrders();
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  const { data: contratos = [], isLoading: isLoadingContracts } = useContracts();

  const isLoading = isLoadingAsset || isLoadingCustomer || isLoadingOrders || isLoadingTickets || isLoadingContracts;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  if (!a) throw notFound();

  const historico = ordens.filter((o) => o.assetId === a.id);
  const ticketsRel = tickets.filter((t) => historico.some((o) => o.ticketId === t.id));
  const contratoRel = contratos.find((c) => c.customerId === a.customerId && c.status === "active");
  const timeline: TimelineEntry[] = [
    ...(a.installedAt ? [{ d: a.installedAt, label: "Instalado" }] : []),
    ...historico.map((o) => ({ d: o.createdAt, label: `OS ${o.osNumber}: ${o.description}` })),
    ...(a.lastReadingAt ? [{ d: a.lastReadingAt, label: "Última leitura" }] : []),
  ].sort((x, y) => (x.d < y.d ? 1 : -1));

  return (
    <PageContainer>
      <Link
        to="/ativos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ativos
      </Link>
      <PageHeader
        title={a.assetTag}
        description={[a.assetModelId, cli?.legalName].filter(Boolean).join(" · ")}
        actions={<Badge variant="outline">{a.status}</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Dados</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info label="Tag" value={a.assetTag} />
            <Info label="Status" value={<Badge>{a.status}</Badge>} />
            <Info label="Modelo" value={a.assetModelId ?? "—"} />
            <Info label="Tipo" value={a.catalogItemId ?? "—"} />
            <Info
              label="Cliente"
              value={
                cli ? (
                  <Link
                    to="/clientes/$id"
                    params={{ id: cli.id }}
                    className="text-primary hover:underline"
                  >
                    {cli.legalName}
                  </Link>
                ) : (
                  "Sem cliente"
                )
              }
            />
            <Info label="Localização" value={a.siteName ?? "—"} />
            <Info label="Instalado em" value={formatDate(a.installedAt)} />
            <Info label="Última leitura" value={formatDate(a.lastReadingAt)} />
            <Info
              label="Contrato vigente"
              value={
                contratoRel ? (
                  <Link
                    to="/contratos/$id"
                    params={{ id: contratoRel.id }}
                    className="text-primary hover:underline"
                  >
                    {contratoRel.contractNumber}
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
              {timeline.map((e, i) => (
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
                    <span className="font-medium">{o.osNumber}</span>
                    <Badge variant="outline">{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{o.description}</p>
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
                    <span className="font-medium">{t.ticketNumber}</span>
                    <Badge variant="outline">{t.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.subject}</p>
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
