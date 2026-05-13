import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useAppStore,
  formatBRL,
  formatDate,
  calcOrcamentoTotal,
  calcEstoque,
} from "@/lib/mock/store";
import { ESTAGIOS } from "@/lib/mock/types";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  FileText,
  Target,
  Wrench,
  Wallet,
  LifeBuoy,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GreenLink ADM" },
      { name: "description", content: "Visão geral da operação GreenLink." },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${accent ?? "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const {
    leads,
    oportunidades,
    orcamentos,
    clientes,
    pedidos,
    ordens,
    lancamentos,
    tickets,
    catalogo,
    movimentacoes,
  } = useAppStore();
  const leadsNovos = leads.filter((l) => l.status === "novo").length;
  const oppAbertas = oportunidades.filter((o) => !["ganho", "perdido"].includes(o.estagio));
  const orcPendentes = orcamentos.filter((o) => ["rascunho", "enviado"].includes(o.status));
  const totalGanho = oportunidades
    .filter((o) => o.estagio === "ganho")
    .reduce((a, o) => a + o.valor, 0);
  const ticketMedio = oppAbertas.length
    ? oppAbertas.reduce((a, o) => a + o.valor, 0) / oppAbertas.length
    : 0;

  const osAbertas = ordens.filter((o) => o.status !== "concluida" && o.status !== "cancelada");
  const hoje = new Date();
  const em30 = new Date();
  em30.setDate(hoje.getDate() + 30);
  const aReceber30 = lancamentos
    .filter((l) => l.tipo === "receber" && l.status !== "pago" && new Date(l.vencimento) <= em30)
    .reduce((a, l) => a + l.valor, 0);
  const ticketsCriticos = tickets.filter(
    (t) => t.status !== "resolvido" && (t.prioridade === "alta" || t.prioridade === "critica"),
  ).length;
  const estoqueCritico = catalogo.filter(
    (i) => i.tipo !== "servico" && calcEstoque(i.id, movimentacoes) < (i.estoqueMinimo ?? 10),
  );

  const funilCounts = ESTAGIOS.map((e) => ({
    ...e,
    count: oportunidades.filter((o) => o.estagio === e.id).length,
    valor: oportunidades.filter((o) => o.estagio === e.id).reduce((a, o) => a + o.valor, 0),
  }));
  const maxFunil = Math.max(1, ...funilCounts.map((f) => f.count));

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Visão geral do que está acontecendo agora." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Kpi
          label="Leads novos"
          value={String(leadsNovos)}
          hint={`hoje · ${leads.length} no total`}
          icon={Users}
        />
        <Kpi
          label="Oportunidades abertas"
          value={String(oppAbertas.length)}
          hint={`em aberto · ${formatBRL(oppAbertas.reduce((a, o) => a + o.valor, 0))}`}
          icon={Target}
        />
        <Kpi
          label="Orçamentos pendentes"
          value={String(orcPendentes.length)}
          hint={`a aprovar · ${orcamentos.length} no total`}
          icon={FileText}
        />
        <Kpi
          label="Ticket médio (aberto)"
          value={formatBRL(ticketMedio)}
          hint={`Ganho acumulado: ${formatBRL(totalGanho)}`}
          icon={TrendingUp}
          accent="bg-success/10 text-success"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3">
        <Kpi
          label="OS abertas"
          value={String(osAbertas.length)}
          hint={`agora · ${ordens.length} no total`}
          icon={Wrench}
          accent="bg-warning/15 text-warning-foreground"
        />
        <Kpi
          label="A receber 30d"
          value={formatBRL(aReceber30)}
          hint="próximos 30 dias"
          icon={Wallet}
          accent="bg-success/10 text-success"
        />
        <Kpi
          label="Tickets críticos"
          value={String(ticketsCriticos)}
          hint={`abertos · ${tickets.length} no total`}
          icon={LifeBuoy}
          accent="bg-destructive/10 text-destructive"
        />
        <Kpi
          label="Estoque crítico"
          value={String(estoqueCritico.length)}
          hint="itens abaixo do mínimo agora"
          icon={Boxes}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Funil de oportunidades</h2>
            <Link
              to="/pipeline"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver pipeline <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {funilCounts.map((f) => (
              <div key={f.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-muted-foreground">
                    {f.count} · {formatBRL(f.valor)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-glow"
                    style={{ width: `${(f.count / maxFunil) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">Resumo</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Clientes</span>
              <span className="font-medium">{clientes.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Leads</span>
              <span className="font-medium">{leads.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Orçamentos</span>
              <span className="font-medium">{orcamentos.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-medium">{pedidos.length}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Orçamentos recentes</h2>
          <div className="space-y-2">
            {orcamentos.slice(0, 5).map((o) => {
              const cli = clientes.find((c) => c.id === o.clienteId);
              return (
                <Link
                  key={o.id}
                  to="/orcamentos/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{o.numero}</p>
                    <p className="text-xs text-muted-foreground">
                      {cli?.nome ?? "—"} · {formatDate(o.criadoEm)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(calcOrcamentoTotal(o))}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
            {!orcamentos.length && (
              <p className="text-sm text-muted-foreground">Nenhum orçamento ainda.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">Leads recentes</h2>
          <div className="space-y-2">
            {leads.slice(0, 5).map((l) => (
              <Link
                key={l.id}
                to="/leads"
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium">{l.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.empresa ?? "Pessoa física"} · {l.origem}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {l.status}
                </Badge>
              </Link>
            ))}
            {!leads.length && <p className="text-sm text-muted-foreground">Nenhum lead.</p>}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">OS em aberto</h2>
            <Link
              to="/os"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver OS <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {osAbertas.slice(0, 5).map((o) => {
              const cli = clientes.find((c) => c.id === o.clienteId);
              return (
                <Link
                  key={o.id}
                  to="/os/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {o.numero} — {o.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cli?.nome ?? "—"} · {o.tecnico ?? "Sem técnico"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {o.prioridade}
                  </Badge>
                </Link>
              );
            })}
            {!osAbertas.length && (
              <p className="text-sm text-muted-foreground">Sem OS em aberto.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Faturas próximas</h2>
            <Link
              to="/financeiro"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver financeiro <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {lancamentos
              .filter((l) => l.status !== "pago" && l.tipo === "receber")
              .slice(0, 5)
              .map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{l.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {clientes.find((c) => c.id === l.clienteId)?.nome ?? "—"} · vence{" "}
                      {formatDate(l.vencimento)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(l.valor)}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {l.status}
                    </Badge>
                  </div>
                </div>
              ))}
            {!lancamentos.filter((l) => l.status !== "pago" && l.tipo === "receber").length && (
              <p className="text-sm text-muted-foreground">Nenhuma fatura pendente.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
