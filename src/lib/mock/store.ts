import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Cliente, Lead, Oportunidade, ItemCatalogo, Orcamento, Pedido, OrcamentoItem,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// ---------- seed ----------
const seedClientes: Cliente[] = [
  {
    id: "c1", tipo: "pj", nome: "Fazenda Vale Verde",
    documento: "12.345.678/0001-90", email: "contato@valeverde.com.br",
    telefone: "(31) 3333-1010", cidade: "Sete Lagoas", estado: "MG",
    endereco: "Rod. MG-238, km 12", contatos: [
      { id: uid(), nome: "Mariana Souza", cargo: "Gerente", email: "mariana@valeverde.com.br", telefone: "(31) 99888-1010" },
    ], criadoEm: now(),
  },
  {
    id: "c2", tipo: "pj", nome: "AgroTech Cerrado",
    documento: "98.765.432/0001-10", email: "ti@agrotechcerrado.com",
    telefone: "(62) 3222-4040", cidade: "Goiânia", estado: "GO",
    contatos: [{ id: uid(), nome: "Ricardo Lima", cargo: "Diretor", email: "ricardo@agrotechcerrado.com" }],
    criadoEm: now(),
  },
  {
    id: "c3", tipo: "pf", nome: "Carlos Mendes",
    documento: "111.222.333-44", email: "carlos@example.com",
    telefone: "(11) 98888-2020", cidade: "Campinas", estado: "SP",
    contatos: [], criadoEm: now(),
  },
];

const seedLeads: Lead[] = [
  { id: "l1", nome: "Sítio Boa Vista", email: "joao@sitio.com", telefone: "(35) 99000-1111", origem: "site", status: "novo", criadoEm: now() },
  { id: "l2", nome: "Rancho Alegre", empresa: "Rancho Alegre LTDA", email: "contato@ranchoalegre.com", origem: "indicacao", status: "qualificado", criadoEm: now() },
  { id: "l3", nome: "AgroPlus", origem: "evento", status: "contatado", criadoEm: now() },
];

const seedOportunidades: Oportunidade[] = [
  { id: "o1", titulo: "Sensores IoT 50ha", clienteId: "c1", valor: 45000, estagio: "proposta", responsavel: "Time Comercial", criadoEm: now() },
  { id: "o2", titulo: "Renovação Suporte", clienteId: "c2", valor: 18000, estagio: "negociacao", criadoEm: now() },
  { id: "o3", titulo: "Estação meteorológica", clienteId: "c3", valor: 8500, estagio: "qualificado", criadoEm: now() },
  { id: "o4", titulo: "Telemetria Reservatórios", clienteId: "c1", valor: 32000, estagio: "novo", criadoEm: now() },
  { id: "o5", titulo: "Expansão rede LoRa", clienteId: "c2", valor: 67000, estagio: "ganho", criadoEm: now() },
];

const seedCatalogo: ItemCatalogo[] = [
  { id: "p1", codigo: "SNS-001", nome: "Sensor de Umidade do Solo", tipo: "produto", unidade: "un", preco: 480, ativo: true },
  { id: "p2", codigo: "SNS-002", nome: "Estação Meteorológica Compacta", tipo: "produto", unidade: "un", preco: 4200, ativo: true },
  { id: "p3", codigo: "GTW-100", nome: "Gateway LoRa GreenLink", tipo: "produto", unidade: "un", preco: 2800, ativo: true },
  { id: "s1", codigo: "SRV-INST", nome: "Instalação em campo", tipo: "servico", unidade: "h", preco: 220, ativo: true },
  { id: "s2", codigo: "SRV-SUP", nome: "Suporte mensal", tipo: "servico", unidade: "mês", preco: 950, ativo: true },
  { id: "k1", codigo: "KIT-FAZ", nome: "Kit Fazenda 10ha", tipo: "kit", unidade: "kit", preco: 12500, ativo: true },
];

const seedOrcamentos: Orcamento[] = [
  {
    id: "or1", numero: "ORC-0001", clienteId: "c1",
    itens: [
      { itemId: "p1", codigo: "SNS-001", nome: "Sensor de Umidade do Solo", quantidade: 20, precoUnit: 480, desconto: 0 },
      { itemId: "s1", codigo: "SRV-INST", nome: "Instalação em campo", quantidade: 8, precoUnit: 220, desconto: 0 },
    ],
    desconto: 0, status: "enviado", criadoEm: now(),
  },
];

// ---------- helpers ----------
export const calcOrcamentoTotal = (o: Pick<Orcamento, "itens" | "desconto">) => {
  const sub = o.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnit - i.desconto, 0);
  return Math.max(0, sub - o.desconto);
};

// ---------- store ----------
interface State {
  clientes: Cliente[];
  leads: Lead[];
  oportunidades: Oportunidade[];
  catalogo: ItemCatalogo[];
  orcamentos: Orcamento[];
  pedidos: Pedido[];

  addCliente: (c: Omit<Cliente, "id" | "criadoEm" | "contatos"> & { contatos?: Cliente["contatos"] }) => Cliente;
  updateCliente: (id: string, patch: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;

  addLead: (l: Omit<Lead, "id" | "criadoEm" | "status"> & { status?: Lead["status"] }) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  converterLead: (id: string) => { cliente: Cliente; oportunidade: Oportunidade } | null;

  addOportunidade: (o: Omit<Oportunidade, "id" | "criadoEm">) => Oportunidade;
  updateOportunidade: (id: string, patch: Partial<Oportunidade>) => void;
  moverOportunidade: (id: string, estagio: Oportunidade["estagio"]) => void;
  removeOportunidade: (id: string) => void;

  addItemCatalogo: (i: Omit<ItemCatalogo, "id">) => ItemCatalogo;
  updateItemCatalogo: (id: string, patch: Partial<ItemCatalogo>) => void;
  removeItemCatalogo: (id: string) => void;

  addOrcamento: (o: Omit<Orcamento, "id" | "numero" | "criadoEm" | "status"> & { status?: Orcamento["status"] }) => Orcamento;
  updateOrcamento: (id: string, patch: Partial<Orcamento>) => void;
  removeOrcamento: (id: string) => void;
  aprovarOrcamento: (id: string) => Pedido | null;
}

let orcCounter = 1;
let pedCounter = 0;

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      clientes: seedClientes,
      leads: seedLeads,
      oportunidades: seedOportunidades,
      catalogo: seedCatalogo,
      orcamentos: seedOrcamentos,
      pedidos: [],

      addCliente: (c) => {
        const novo: Cliente = { ...c, id: uid(), criadoEm: now(), contatos: c.contatos ?? [] };
        set((s) => ({ clientes: [novo, ...s.clientes] }));
        return novo;
      },
      updateCliente: (id, patch) =>
        set((s) => ({ clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      addLead: (l) => {
        const novo: Lead = { ...l, id: uid(), criadoEm: now(), status: l.status ?? "novo" };
        set((s) => ({ leads: [novo, ...s.leads] }));
        return novo;
      },
      updateLead: (id, patch) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      removeLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      converterLead: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (!lead) return null;
        const cliente = get().addCliente({
          tipo: lead.empresa ? "pj" : "pf",
          nome: lead.empresa ?? lead.nome,
          email: lead.email,
          telefone: lead.telefone,
          contatos: lead.empresa ? [{ id: uid(), nome: lead.nome, email: lead.email, telefone: lead.telefone }] : [],
        });
        const oportunidade = get().addOportunidade({
          titulo: `Oportunidade — ${cliente.nome}`,
          clienteId: cliente.id,
          valor: 0,
          estagio: "novo",
        });
        get().updateLead(id, { status: "qualificado", convertidoEm: now(), clienteId: cliente.id });
        return { cliente, oportunidade };
      },

      addOportunidade: (o) => {
        const novo: Oportunidade = { ...o, id: uid(), criadoEm: now() };
        set((s) => ({ oportunidades: [novo, ...s.oportunidades] }));
        return novo;
      },
      updateOportunidade: (id, patch) =>
        set((s) => ({ oportunidades: s.oportunidades.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      moverOportunidade: (id, estagio) =>
        set((s) => ({ oportunidades: s.oportunidades.map((o) => (o.id === id ? { ...o, estagio } : o)) })),
      removeOportunidade: (id) => set((s) => ({ oportunidades: s.oportunidades.filter((o) => o.id !== id) })),

      addItemCatalogo: (i) => {
        const novo: ItemCatalogo = { ...i, id: uid() };
        set((s) => ({ catalogo: [novo, ...s.catalogo] }));
        return novo;
      },
      updateItemCatalogo: (id, patch) =>
        set((s) => ({ catalogo: s.catalogo.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeItemCatalogo: (id) => set((s) => ({ catalogo: s.catalogo.filter((i) => i.id !== id) })),

      addOrcamento: (o) => {
        const numero = `ORC-${String(get().orcamentos.length + 1).padStart(4, "0")}`;
        const novo: Orcamento = { ...o, id: uid(), numero, criadoEm: now(), status: o.status ?? "rascunho" };
        set((s) => ({ orcamentos: [novo, ...s.orcamentos] }));
        return novo;
      },
      updateOrcamento: (id, patch) =>
        set((s) => ({ orcamentos: s.orcamentos.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      removeOrcamento: (id) => set((s) => ({ orcamentos: s.orcamentos.filter((o) => o.id !== id) })),
      aprovarOrcamento: (id) => {
        const orc = get().orcamentos.find((o) => o.id === id);
        if (!orc) return null;
        const total = calcOrcamentoTotal(orc);
        const numero = `PED-${String(get().pedidos.length + 1).padStart(4, "0")}`;
        const pedido: Pedido = {
          id: uid(), numero, orcamentoId: orc.id, clienteId: orc.clienteId,
          total, criadoEm: now(), status: "aberto",
        };
        set((s) => ({
          pedidos: [pedido, ...s.pedidos],
          orcamentos: s.orcamentos.map((o) => (o.id === id ? { ...o, status: "convertido", pedidoId: pedido.id } : o)),
        }));
        return pedido;
      },
    }),
    { name: "greenlink-adm-v1" },
  ),
);

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

export type { OrcamentoItem };
