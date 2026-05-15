import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import {
  useLeads,
  useOpportunities,
  useQuotes,
  useCustomers,
  useOrders,
  useServiceOrders,
  useReceivables,
  useTickets,
  useCatalog,
  useInventoryMovements,
} from "@/hooks/domain";
import { formatBRL, formatDate } from "@/lib/formatters";
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
  Loader2,
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
  const { data: leads = [], isLoading: isLoadingLeads } = useLeads();
  const { data: opportunities = [], isLoading: isLoadingOpportunities } = useOpportunities();
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuotes();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const { data: serviceOrders = [], isLoading: isLoadingServiceOrders } = useServiceOrders();
  const { data: receivables = [], isLoading: isLoadingReceivables } = useReceivables();
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  const { data: catalog = [], isLoading: isLoadingCatalog } = useCatalog();
  const { data: movements = [], isLoading: isLoadingMovements } = useInventoryMovements();

  const isLoading =
    isLoadingLeads ||
    isLoadingOpportunities ||
    isLoadingQuotes ||
    isLoadingCustomers ||
    isLoadingOrders ||
    isLoadingServiceOrders ||
    isLoadingReceivables ||
    isLoadingTickets ||
    isLoadingCatalog ||
    isLoadingMovements;

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" description="Carregando dados..." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  const leadsNovos = leads.filter((l) => l.status === "novo").length;
  const oppAbertas = opportunities.filter((o) => !["ganho", "perdido"].includes(o.stage));
  const orcPendentes = quotes.filter((o) => ["draft", "sent"].includes(o.status));
  const totalGanho = opportunities
    .filter((o) => o.stage === "ganho")
    .reduce((a, o) => a + o.amount, 0);
  const ticketMedio = oppAbertas.length
    ? oppAbertas.reduce((a, o) => a + o.amount, 0) / oppAbertas.length
    : 0;

  const osAbertas = serviceOrders.filter((o) => o.status !== "done" && o.status !== "cancelled");
  const hoje = new Date();
  const em30 = new Date();
  em30.setDate(hoje.getDate() + 30);
  const aReceber30 = receivables
    .filter((l) => l.status !== "paid" && new Date(l.dueDate) <= em30)
    .reduce((a, l) => a + l.amount, 0);
  const ticketsCriticos = tickets.filter(
    (t) => t.status !== "resolved" && (t.priority === "high" || t.priority === "urgent"),
  ).length;

  // Simplificado para dashboard
  const estoqueCritico = catalog.filter((i) => i.itemType !== "service" && i.isActive);

  const ESTAGIOS = [
    { id: "novo", label: "Novo" },
    { id: "qualificado", label: "Qualificado" },
    { id: "proposta", label: "Proposta" },
    { id: "negociacao", label: "Negociação" },
    { id: "ganho", label: "Ganho" },
    { id: "perdido", label: "Perdido" },
  ];

  const funilCounts = ESTAGIOS.map((e) => ({
    ...e,
    count: opportunities.filter((o) => o.stage === e.id).length,
    valor: opportunities.filter((o) => o.stage === e.id).reduce((a, o) => a + o.amount, 0),
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
          hint={`em aberto · ${formatBRL(oppAbertas.reduce((a, o) => a + o.amount, 0))}`}
          icon={Target}
        />
        <Kpi
          label="Orçamentos pendentes"
          value={String(orcPendentes.length)}
          hint={`a aprovar · ${quotes.length} no total`}
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
          hint={`agora · ${serviceOrders.length} no total`}
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
          hint="itens ativos no catálogo"
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
              <span className="font-medium">{customers.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Leads</span>
              <span className="font-medium">{leads.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Orçamentos</span>
              <span className="font-medium">{quotes.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-medium">{orders.length}</span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Orçamentos recentes</h2>
          <div className="space-y-2">
            {quotes.slice(0, 5).map((o) => {
              const cli = customers.find((c) => c.id === o.customerId);
              return (
                <Link
                  key={o.id}
                  to="/orcamentos/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{o.quoteNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {cli?.legalName ?? "—"} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(o.totalAmount)}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
            {!quotes.length && (
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
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.companyName ?? "Pessoa física"} · {l.source}
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
              const cli = customers.find((c) => c.id === o.customerId);
              return (
                <Link
                  key={o.id}
                  to="/os/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {o.osNumber} — {o.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cli?.legalName ?? "—"} · {o.assignedTo ?? "Sem técnico"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {o.priority}
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
            {receivables
              .filter((l) => l.status !== "paid")
              .slice(0, 5)
              .map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">{l.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {customers.find((c) => c.id === l.customerId)?.legalName ?? "—"} · vence{" "}
                      {formatDate(l.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatBRL(l.amount)}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {l.status}
                    </Badge>
                  </div>
                </div>
              ))}
            {!receivables.filter((l) => l.status !== "paid").length && (
              <p className="text-sm text-muted-foreground">Nenhuma fatura pendente.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
