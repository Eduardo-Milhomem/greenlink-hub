import type {
  Customer,
  Lead,
  Opportunity,
  Quote,
  CustomerOrder,
  Contract,
  ServiceOrder,
  Asset,
  SupportTicket,
  CatalogItem,
} from "@/types";
import type { GlobalSearchItem } from "@/lib/search";

export function buildGlobalSearchIndex(input: {
  clientes: Customer[];
  leads: Lead[];
  oportunidades: Opportunity[];
  orcamentos: Quote[];
  pedidos: CustomerOrder[];
  contratos: Contract[];
  ordens: ServiceOrder[];
  ativos: Asset[];
  tickets: SupportTicket[];
  catalogo: CatalogItem[];
}) {
  const clienteNome = new Map(input.clientes.map((c) => [c.id, c.legalName]));

  const items: GlobalSearchItem[] = [];

  for (const c of input.clientes) {
    items.push({
      kind: "cliente",
      id: c.id,
      title: c.legalName,
      subtitle: [c.documentNumber, [c.city, c.state].filter(Boolean).join("/")]
        .filter(Boolean)
        .join(" · "),
      keywords: [c.email, c.phone].filter(Boolean) as string[],
      target: { to: "/clientes/$id", params: { id: c.id } },
    });
  }

  for (const l of input.leads) {
    items.push({
      kind: "lead",
      id: l.id,
      title: l.name,
      subtitle: [l.companyName ?? "Pessoa física", l.source, l.status].filter(Boolean).join(" · "),
      keywords: [l.email, l.phone].filter(Boolean) as string[],
      target: { to: "/leads" },
    });
  }

  for (const o of input.oportunidades) {
    items.push({
      kind: "oportunidade",
      id: o.id,
      title: o.title,
      subtitle: [clienteNome.get(o.customerId!) ?? "—", o.stage].filter(Boolean).join(" · "),
      keywords: [o.assignedTo].filter(Boolean) as string[],
      target: { to: "/pipeline" },
    });
  }

  for (const o of input.orcamentos) {
    items.push({
      kind: "orcamento",
      id: o.id,
      title: o.quoteNumber,
      subtitle: [clienteNome.get(o.customerId) ?? "—", o.status].filter(Boolean).join(" · "),
      keywords: o.items.flatMap((i) => [i.itemDescription]),
      target: { to: "/orcamentos/$id", params: { id: o.id } },
    });
  }

  for (const p of input.pedidos) {
    items.push({
      kind: "pedido",
      id: p.id,
      title: p.orderNumber,
      subtitle: [clienteNome.get(p.customerId) ?? "—", p.status].filter(Boolean).join(" · "),
      target: { to: "/pedidos/$id", params: { id: p.id } },
    });
  }

  for (const c of input.contratos) {
    items.push({
      kind: "contrato",
      id: c.id,
      title: c.contractNumber,
      subtitle: [clienteNome.get(c.customerId) ?? "—", c.status].filter(Boolean).join(" · "),
      keywords: [c.priceIndexer, String(c.monthlyAmount)].filter(Boolean),
      target: { to: "/contratos/$id", params: { id: c.id } },
    });
  }

  for (const o of input.ordens) {
    items.push({
      kind: "os",
      id: o.id,
      title: o.osNumber,
      subtitle: [o.description, clienteNome.get(o.customerId) ?? "—"].filter(Boolean).join(" · "),
      keywords: [o.assignedTo, o.status, o.priority].filter(Boolean) as string[],
      target: { to: "/os/$id", params: { id: o.id } },
    });
  }

  for (const a of input.ativos) {
    items.push({
      kind: "ativo",
      id: a.id,
      title: a.assetTag,
      subtitle: [a.assetModelId, clienteNome.get(a.customerId ?? "")].filter(Boolean).join(" · "),
      keywords: [a.catalogItemId, a.siteName, a.status].filter(Boolean) as string[],
      target: { to: "/ativos/$id", params: { id: a.id } },
    });
  }

  for (const t of input.tickets) {
    items.push({
      kind: "ticket",
      id: t.id,
      title: t.ticketNumber,
      subtitle: [t.subject, clienteNome.get(t.customerId) ?? "—"].filter(Boolean).join(" · "),
      keywords: [t.channel, t.status, t.priority].filter(Boolean) as string[],
      target: { to: "/suporte/$id", params: { id: t.id } },
    });
  }

  for (const i of input.catalogo) {
    items.push({
      kind: "catalogo",
      id: i.id,
      title: `${i.itemCode} — ${i.name}`,
      subtitle: [i.itemType, i.isActive ? "ativo" : "inativo"].filter(Boolean).join(" · "),
      target: { to: "/catalogo" },
    });
  }

  return items;
}
