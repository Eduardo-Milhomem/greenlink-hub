import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Cliente, Lead, Oportunidade, ItemCatalogo, Orcamento, Pedido, OrcamentoItem,
  Contrato, Ativo, OS, OSTarefa, Movimentacao, Lancamento, Ticket, TicketMensagem,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString(); };
const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x.toISOString(); };

// ---------- seeds ----------
const seedClientes: Cliente[] = [
  { id: "c1", tipo: "pj", nome: "Fazenda Vale Verde", documento: "12.345.678/0001-90",
    email: "contato@valeverde.com.br", telefone: "(31) 3333-1010", cidade: "Sete Lagoas", estado: "MG",
    endereco: "Rod. MG-238, km 12",
    contatos: [{ id: uid(), nome: "Mariana Souza", cargo: "Gerente", email: "mariana@valeverde.com.br", telefone: "(31) 99888-1010" }],
    criadoEm: now() },
  { id: "c2", tipo: "pj", nome: "AgroTech Cerrado", documento: "98.765.432/0001-10",
    email: "ti@agrotechcerrado.com", telefone: "(62) 3222-4040", cidade: "Goiânia", estado: "GO",
    contatos: [{ id: uid(), nome: "Ricardo Lima", cargo: "Diretor", email: "ricardo@agrotechcerrado.com" }],
    criadoEm: now() },
  { id: "c3", tipo: "pf", nome: "Carlos Mendes", documento: "111.222.333-44",
    email: "carlos@example.com", telefone: "(11) 98888-2020", cidade: "Campinas", estado: "SP",
    contatos: [], criadoEm: now() },
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
  { id: "or1", numero: "ORC-0001", clienteId: "c1",
    itens: [
      { itemId: "p1", codigo: "SNS-001", nome: "Sensor de Umidade do Solo", quantidade: 20, precoUnit: 480, desconto: 0 },
      { itemId: "s1", codigo: "SRV-INST", nome: "Instalação em campo", quantidade: 8, precoUnit: 220, desconto: 0 },
    ],
    desconto: 0, status: "enviado", criadoEm: now() },
];

const today = new Date();

const seedContratos: Contrato[] = [
  { id: "ct1", numero: "CTR-0001", clienteId: "c2", inicio: addMonths(today, -6), fim: addMonths(today, 6),
    valorMensal: 1500, indexador: "ipca", proximoReajuste: addMonths(today, 6),
    status: "ativo", descricao: "Suporte mensal e monitoramento", criadoEm: now() },
  { id: "ct2", numero: "CTR-0002", clienteId: "c1", inicio: addMonths(today, -2), fim: addMonths(today, 22),
    valorMensal: 3200, indexador: "fixo", status: "ativo",
    descricao: "Locação de gateways e estações", criadoEm: now() },
];

const seedAtivos: Ativo[] = [
  { id: "a1", tag: "GTW-VV-01", modelo: "Gateway LoRa GL-100", tipo: "Gateway", clienteId: "c1",
    localizacao: "Galpão central", status: "ativo", ultimaLeitura: addDays(today, -1), instaladoEm: addMonths(today, -3) },
  { id: "a2", tag: "SNS-VV-12", modelo: "Sensor Umidade SU-2", tipo: "Sensor", clienteId: "c1",
    localizacao: "Talhão 4", status: "ativo", ultimaLeitura: addDays(today, 0), instaladoEm: addMonths(today, -3) },
  { id: "a3", tag: "EST-AT-01", modelo: "Estação Meteorológica Compacta", tipo: "Estação", clienteId: "c2",
    localizacao: "Sede AgroTech", status: "manutencao", ultimaLeitura: addDays(today, -10) },
];

const seedOS: OS[] = [
  { id: "os1", numero: "OS-0001", titulo: "Manutenção estação meteorológica", clienteId: "c2",
    prioridade: "alta", status: "aberta", tecnico: "João Pereira", endereco: "Goiânia/GO — Sede",
    sla: addDays(today, 2), tarefas: [
      { id: uid(), descricao: "Inspecionar painel solar", feita: false },
      { id: uid(), descricao: "Substituir bateria 12V", feita: false },
      { id: uid(), descricao: "Testar comunicação LoRa", feita: false },
    ], ativosIds: ["a3"], horasGastas: 0, criadoEm: now() },
  { id: "os2", numero: "OS-0002", titulo: "Instalação de 20 sensores", clienteId: "c1",
    prioridade: "media", status: "em_execucao", tecnico: "Marcos Andrade", endereco: "Sete Lagoas/MG",
    sla: addDays(today, 5), tarefas: [
      { id: uid(), descricao: "Mapear pontos com GPS", feita: true },
      { id: uid(), descricao: "Fixar sensores no solo", feita: false },
      { id: uid(), descricao: "Calibrar leitura", feita: false },
    ], ativosIds: ["a1", "a2"], horasGastas: 4, criadoEm: now() },
  { id: "os3", numero: "OS-0003", titulo: "Visita técnica trimestral", clienteId: "c1",
    prioridade: "baixa", status: "concluida", tecnico: "João Pereira",
    sla: addDays(today, -5), tarefas: [{ id: uid(), descricao: "Vistoria geral", feita: true }],
    ativosIds: [], horasGastas: 2, criadoEm: addDays(today, -10), concluidaEm: addDays(today, -5) },
];

const seedMovs: Movimentacao[] = [
  { id: uid(), itemId: "p1", tipo: "entrada", quantidade: 100, motivo: "Compra inicial", criadoEm: addDays(today, -30) },
  { id: uid(), itemId: "p1", tipo: "saida", quantidade: 20, motivo: "OS-0002", osId: "os2", criadoEm: addDays(today, -2) },
  { id: uid(), itemId: "p2", tipo: "entrada", quantidade: 10, motivo: "Compra", criadoEm: addDays(today, -20) },
  { id: uid(), itemId: "p3", tipo: "entrada", quantidade: 15, motivo: "Compra", criadoEm: addDays(today, -25) },
  { id: uid(), itemId: "p3", tipo: "saida", quantidade: 2, motivo: "Instalação", criadoEm: addDays(today, -10) },
];

const seedLancamentos: Lancamento[] = [
  { id: uid(), tipo: "receber", descricao: "Mensalidade CTR-0001", clienteId: "c2", valor: 1500,
    vencimento: addDays(today, -5), status: "vencido", origem: "contrato", contratoId: "ct1", criadoEm: now() },
  { id: uid(), tipo: "receber", descricao: "Mensalidade CTR-0001", clienteId: "c2", valor: 1500,
    vencimento: addDays(today, 25), status: "aberto", origem: "contrato", contratoId: "ct1", criadoEm: now() },
  { id: uid(), tipo: "receber", descricao: "Mensalidade CTR-0002", clienteId: "c1", valor: 3200,
    vencimento: addDays(today, 10), status: "aberto", origem: "contrato", contratoId: "ct2", criadoEm: now() },
  { id: uid(), tipo: "pagar", descricao: "Fornecedor sensores", fornecedor: "ChipSense Imp.", valor: 12400,
    vencimento: addDays(today, 7), status: "aberto", origem: "manual", criadoEm: now() },
  { id: uid(), tipo: "pagar", descricao: "Conta de energia escritório", fornecedor: "CEMIG", valor: 980,
    vencimento: addDays(today, -2), status: "vencido", origem: "manual", criadoEm: now() },
  { id: uid(), tipo: "receber", descricao: "Pedido ORC-0001", clienteId: "c1", valor: 11360,
    vencimento: addDays(today, 15), status: "aberto", origem: "pedido", criadoEm: now() },
];

const seedTickets: Ticket[] = [
  { id: "t1", numero: "TKT-0001", assunto: "Gateway sem comunicação", clienteId: "c1",
    canal: "whatsapp", prioridade: "alta", status: "andamento", sla: addDays(today, 1),
    mensagens: [
      { id: uid(), autor: "Mariana Souza", interno: false, texto: "Nosso gateway parou de transmitir desde ontem.", criadoEm: addDays(today, -1) },
      { id: uid(), autor: "Suporte GL", interno: false, texto: "Vamos abrir uma OS e enviar técnico.", criadoEm: now() },
    ], criadoEm: addDays(today, -1) },
  { id: "t2", numero: "TKT-0002", assunto: "Dúvida sobre fatura", clienteId: "c2",
    canal: "email", prioridade: "media", status: "aguardando", sla: addDays(today, 3),
    mensagens: [{ id: uid(), autor: "Ricardo Lima", interno: false, texto: "Por que esse mês veio com valor diferente?", criadoEm: addDays(today, -2) }],
    criadoEm: addDays(today, -2) },
  { id: "t3", numero: "TKT-0003", assunto: "Solicitar treinamento", clienteId: "c3",
    canal: "portal", prioridade: "baixa", status: "novo",
    mensagens: [{ id: uid(), autor: "Carlos Mendes", interno: false, texto: "Gostaria de agendar um treinamento.", criadoEm: now() }],
    criadoEm: now() },
];

// ---------- helpers ----------
export const calcOrcamentoTotal = (o: Pick<Orcamento, "itens" | "desconto">) => {
  const sub = o.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnit - i.desconto, 0);
  return Math.max(0, sub - o.desconto);
};

export const calcEstoque = (itemId: string, movs: Movimentacao[]) => {
  return movs.filter((m) => m.itemId === itemId).reduce((acc, m) => {
    if (m.tipo === "entrada" || m.tipo === "ajuste") return acc + m.quantidade;
    if (m.tipo === "saida" || m.tipo === "reserva") return acc - m.quantidade;
    return acc;
  }, 0);
};

// ---------- store ----------
interface State {
  clientes: Cliente[]; leads: Lead[]; oportunidades: Oportunidade[];
  catalogo: ItemCatalogo[]; orcamentos: Orcamento[]; pedidos: Pedido[];
  contratos: Contrato[]; ativos: Ativo[]; ordens: OS[];
  movimentacoes: Movimentacao[]; lancamentos: Lancamento[]; tickets: Ticket[];

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

  // Contratos
  addContrato: (c: Omit<Contrato, "id" | "numero" | "criadoEm" | "status"> & { status?: Contrato["status"] }) => Contrato;
  updateContrato: (id: string, patch: Partial<Contrato>) => void;
  removeContrato: (id: string) => void;
  faturarContrato: (id: string, mesRef?: string) => Lancamento | null;

  // Ativos
  addAtivo: (a: Omit<Ativo, "id">) => Ativo;
  updateAtivo: (id: string, patch: Partial<Ativo>) => void;
  removeAtivo: (id: string) => void;

  // OS
  addOS: (o: Omit<OS, "id" | "numero" | "criadoEm" | "status"> & { status?: OS["status"] }) => OS;
  updateOS: (id: string, patch: Partial<OS>) => void;
  toggleTarefa: (osId: string, tarefaId: string) => void;
  concluirOS: (id: string) => void;
  removeOS: (id: string) => void;

  // Estoque
  addMovimentacao: (m: Omit<Movimentacao, "id" | "criadoEm">) => Movimentacao;

  // Financeiro
  addLancamento: (l: Omit<Lancamento, "id" | "criadoEm" | "status"> & { status?: Lancamento["status"] }) => Lancamento;
  marcarPago: (id: string) => void;
  estornar: (id: string) => void;
  removeLancamento: (id: string) => void;

  // Suporte
  addTicket: (t: Omit<Ticket, "id" | "numero" | "criadoEm" | "status" | "mensagens"> & { status?: Ticket["status"]; mensagens?: TicketMensagem[] }) => Ticket;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  addMensagemTicket: (id: string, msg: Omit<TicketMensagem, "id" | "criadoEm">) => void;
  removeTicket: (id: string) => void;
  ticketParaOS: (id: string) => OS | null;
}

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      clientes: seedClientes, leads: seedLeads, oportunidades: seedOportunidades,
      catalogo: seedCatalogo, orcamentos: seedOrcamentos, pedidos: [],
      contratos: seedContratos, ativos: seedAtivos, ordens: seedOS,
      movimentacoes: seedMovs, lancamentos: seedLancamentos, tickets: seedTickets,

      addCliente: (c) => {
        const novo: Cliente = { ...c, id: uid(), criadoEm: now(), contatos: c.contatos ?? [] };
        set((s) => ({ clientes: [novo, ...s.clientes] })); return novo;
      },
      updateCliente: (id, patch) => set((s) => ({ clientes: s.clientes.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeCliente: (id) => set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),

      addLead: (l) => {
        const novo: Lead = { ...l, id: uid(), criadoEm: now(), status: l.status ?? "novo" };
        set((s) => ({ leads: [novo, ...s.leads] })); return novo;
      },
      updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, ...patch } : l) })),
      removeLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      converterLead: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (!lead) return null;
        const cliente = get().addCliente({
          tipo: lead.empresa ? "pj" : "pf",
          nome: lead.empresa ?? lead.nome,
          email: lead.email, telefone: lead.telefone,
          contatos: lead.empresa ? [{ id: uid(), nome: lead.nome, email: lead.email, telefone: lead.telefone }] : [],
        });
        const oportunidade = get().addOportunidade({
          titulo: `Oportunidade — ${cliente.nome}`, clienteId: cliente.id, valor: 0, estagio: "novo",
        });
        get().updateLead(id, { status: "qualificado", convertidoEm: now(), clienteId: cliente.id });
        return { cliente, oportunidade };
      },

      addOportunidade: (o) => {
        const novo: Oportunidade = { ...o, id: uid(), criadoEm: now() };
        set((s) => ({ oportunidades: [novo, ...s.oportunidades] })); return novo;
      },
      updateOportunidade: (id, patch) => set((s) => ({ oportunidades: s.oportunidades.map((o) => o.id === id ? { ...o, ...patch } : o) })),
      moverOportunidade: (id, estagio) => set((s) => ({ oportunidades: s.oportunidades.map((o) => o.id === id ? { ...o, estagio } : o) })),
      removeOportunidade: (id) => set((s) => ({ oportunidades: s.oportunidades.filter((o) => o.id !== id) })),

      addItemCatalogo: (i) => {
        const novo: ItemCatalogo = { ...i, id: uid() };
        set((s) => ({ catalogo: [novo, ...s.catalogo] })); return novo;
      },
      updateItemCatalogo: (id, patch) => set((s) => ({ catalogo: s.catalogo.map((i) => i.id === id ? { ...i, ...patch } : i) })),
      removeItemCatalogo: (id) => set((s) => ({ catalogo: s.catalogo.filter((i) => i.id !== id) })),

      addOrcamento: (o) => {
        const numero = `ORC-${String(get().orcamentos.length + 1).padStart(4, "0")}`;
        const novo: Orcamento = { ...o, id: uid(), numero, criadoEm: now(), status: o.status ?? "rascunho" };
        set((s) => ({ orcamentos: [novo, ...s.orcamentos] })); return novo;
      },
      updateOrcamento: (id, patch) => set((s) => ({ orcamentos: s.orcamentos.map((o) => o.id === id ? { ...o, ...patch } : o) })),
      removeOrcamento: (id) => set((s) => ({ orcamentos: s.orcamentos.filter((o) => o.id !== id) })),
      aprovarOrcamento: (id) => {
        const orc = get().orcamentos.find((o) => o.id === id); if (!orc) return null;
        const total = calcOrcamentoTotal(orc);
        const numero = `PED-${String(get().pedidos.length + 1).padStart(4, "0")}`;
        const pedido: Pedido = { id: uid(), numero, orcamentoId: orc.id, clienteId: orc.clienteId, total, criadoEm: now(), status: "aberto" };
        // gera lançamento financeiro
        const lanc: Lancamento = {
          id: uid(), tipo: "receber", descricao: `Pedido ${numero}`, clienteId: orc.clienteId,
          valor: total, vencimento: addDays(new Date(), 15), status: "aberto",
          origem: "pedido", pedidoId: pedido.id, criadoEm: now(),
        };
        set((s) => ({
          pedidos: [pedido, ...s.pedidos],
          orcamentos: s.orcamentos.map((o) => o.id === id ? { ...o, status: "convertido", pedidoId: pedido.id } : o),
          lancamentos: [lanc, ...s.lancamentos],
        }));
        return pedido;
      },

      // ---------- Contratos ----------
      addContrato: (c) => {
        const numero = `CTR-${String(get().contratos.length + 1).padStart(4, "0")}`;
        const novo: Contrato = { ...c, id: uid(), numero, criadoEm: now(), status: c.status ?? "ativo" };
        set((s) => ({ contratos: [novo, ...s.contratos] })); return novo;
      },
      updateContrato: (id, patch) => set((s) => ({ contratos: s.contratos.map((c) => c.id === id ? { ...c, ...patch } : c) })),
      removeContrato: (id) => set((s) => ({ contratos: s.contratos.filter((c) => c.id !== id) })),
      faturarContrato: (id) => {
        const ct = get().contratos.find((c) => c.id === id); if (!ct) return null;
        const lanc: Lancamento = {
          id: uid(), tipo: "receber", descricao: `Mensalidade ${ct.numero}`, clienteId: ct.clienteId,
          valor: ct.valorMensal, vencimento: addDays(new Date(), 10),
          status: "aberto", origem: "contrato", contratoId: ct.id, criadoEm: now(),
        };
        set((s) => ({ lancamentos: [lanc, ...s.lancamentos] }));
        return lanc;
      },

      // ---------- Ativos ----------
      addAtivo: (a) => {
        const novo: Ativo = { ...a, id: uid() };
        set((s) => ({ ativos: [novo, ...s.ativos] })); return novo;
      },
      updateAtivo: (id, patch) => set((s) => ({ ativos: s.ativos.map((a) => a.id === id ? { ...a, ...patch } : a) })),
      removeAtivo: (id) => set((s) => ({ ativos: s.ativos.filter((a) => a.id !== id) })),

      // ---------- OS ----------
      addOS: (o) => {
        const numero = `OS-${String(get().ordens.length + 1).padStart(4, "0")}`;
        const novo: OS = { ...o, id: uid(), numero, criadoEm: now(), status: o.status ?? "aberta" };
        set((s) => ({ ordens: [novo, ...s.ordens] })); return novo;
      },
      updateOS: (id, patch) => set((s) => ({ ordens: s.ordens.map((o) => o.id === id ? { ...o, ...patch } : o) })),
      toggleTarefa: (osId, tarefaId) => set((s) => ({
        ordens: s.ordens.map((o) => o.id === osId
          ? { ...o, tarefas: o.tarefas.map((t) => t.id === tarefaId ? { ...t, feita: !t.feita } : t) }
          : o),
      })),
      concluirOS: (id) => set((s) => ({
        ordens: s.ordens.map((o) => o.id === id ? { ...o, status: "concluida", concluidaEm: now() } : o),
      })),
      removeOS: (id) => set((s) => ({ ordens: s.ordens.filter((o) => o.id !== id) })),

      // ---------- Estoque ----------
      addMovimentacao: (m) => {
        const novo: Movimentacao = { ...m, id: uid(), criadoEm: now() };
        set((s) => ({ movimentacoes: [novo, ...s.movimentacoes] })); return novo;
      },

      // ---------- Financeiro ----------
      addLancamento: (l) => {
        const novo: Lancamento = { ...l, id: uid(), criadoEm: now(), status: l.status ?? "aberto" };
        set((s) => ({ lancamentos: [novo, ...s.lancamentos] })); return novo;
      },
      marcarPago: (id) => set((s) => ({
        lancamentos: s.lancamentos.map((l) => l.id === id ? { ...l, status: "pago", pagoEm: now() } : l),
      })),
      estornar: (id) => set((s) => ({
        lancamentos: s.lancamentos.map((l) => l.id === id ? { ...l, status: "aberto", pagoEm: undefined } : l),
      })),
      removeLancamento: (id) => set((s) => ({ lancamentos: s.lancamentos.filter((l) => l.id !== id) })),

      // ---------- Suporte ----------
      addTicket: (t) => {
        const numero = `TKT-${String(get().tickets.length + 1).padStart(4, "0")}`;
        const novo: Ticket = {
          ...t, id: uid(), numero, criadoEm: now(),
          status: t.status ?? "novo", mensagens: t.mensagens ?? [],
        };
        set((s) => ({ tickets: [novo, ...s.tickets] })); return novo;
      },
      updateTicket: (id, patch) => set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? { ...t, ...patch } : t) })),
      addMensagemTicket: (id, msg) => set((s) => ({
        tickets: s.tickets.map((t) => t.id === id
          ? { ...t, mensagens: [...t.mensagens, { ...msg, id: uid(), criadoEm: now() }] }
          : t),
      })),
      removeTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),
      ticketParaOS: (id) => {
        const t = get().tickets.find((x) => x.id === id); if (!t) return null;
        const os = get().addOS({
          titulo: `Atendimento: ${t.assunto}`, clienteId: t.clienteId,
          prioridade: t.prioridade === "critica" ? "critica" : t.prioridade === "alta" ? "alta" : "media",
          tarefas: [], ativosIds: [],
        });
        get().updateTicket(id, { status: "andamento", osId: os.id });
        return os;
      },
    }),
    { name: "greenlink-adm-v2" },
  ),
);

export const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

export type { OrcamentoItem };
