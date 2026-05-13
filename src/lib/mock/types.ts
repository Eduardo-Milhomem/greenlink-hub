export type ID = string;

export type LeadStatus = "novo" | "contatado" | "qualificado" | "descartado";
export type LeadOrigem = "site" | "indicacao" | "evento" | "ads" | "outro";

export interface Lead {
  id: ID;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  origem: LeadOrigem;
  status: LeadStatus;
  observacao?: string;
  criadoEm: string;
  convertidoEm?: string;
  clienteId?: ID;
}

export type ClienteTipo = "pf" | "pj";
export interface Contato {
  id: ID;
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}
export interface Cliente {
  id: ID;
  tipo: ClienteTipo;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  contatos: Contato[];
  observacao?: string;
  criadoEm: string;
}

export type EstagioOportunidade =
  | "novo"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";
export const ESTAGIOS: { id: EstagioOportunidade; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Ganho" },
  { id: "perdido", label: "Perdido" },
];
export interface Oportunidade {
  id: ID;
  titulo: string;
  clienteId: ID;
  valor: number;
  estagio: EstagioOportunidade;
  responsavel?: string;
  observacao?: string;
  criadoEm: string;
}

export type ItemTipo = "produto" | "servico" | "kit";
export interface ItemCatalogo {
  id: ID;
  codigo: string;
  nome: string;
  tipo: ItemTipo;
  unidade: string;
  preco: number;
  ativo: boolean;
  descricao?: string;
  estoqueMinimo?: number;
}

export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "convertido";
export interface OrcamentoItem {
  itemId: ID;
  codigo: string;
  nome: string;
  quantidade: number;
  precoUnit: number;
  desconto: number;
}
export interface Orcamento {
  id: ID;
  numero: string;
  clienteId: ID;
  oportunidadeId?: ID;
  itens: OrcamentoItem[];
  desconto: number;
  observacao?: string;
  status: OrcamentoStatus;
  criadoEm: string;
  validoAte?: string;
  pedidoId?: ID;
}
export interface Pedido {
  id: ID;
  numero: string;
  orcamentoId: ID;
  clienteId: ID;
  total: number;
  criadoEm: string;
  status:
    | "aberto"
    | "aprovado"
    | "faturado"
    | "parcialmente_atendido"
    | "atendido"
    | "cancelado";
  itens?: OrcamentoItem[];
}

export const PEDIDO_STATUS: { id: Pedido["status"]; label: string }[] = [
  { id: "aberto", label: "Aberto" },
  { id: "aprovado", label: "Aprovado" },
  { id: "faturado", label: "Faturado" },
  { id: "parcialmente_atendido", label: "Parcialmente atendido" },
  { id: "atendido", label: "Atendido" },
  { id: "cancelado", label: "Cancelado" },
];

export const ORCAMENTO_STATUS: { id: OrcamentoStatus; label: string }[] = [
  { id: "rascunho", label: "Rascunho" },
  { id: "enviado", label: "Enviado" },
  { id: "aprovado", label: "Aprovado" },
  { id: "recusado", label: "Recusado" },
  { id: "convertido", label: "Convertido em pedido" },
];

// ---------- Contratos ----------
export type ContratoStatus = "ativo" | "suspenso" | "encerrado";
export type ContratoIndexador = "ipca" | "igpm" | "fixo";
export type ContratoTipo =
  | "venda_instalacao"
  | "locacao"
  | "assinatura"
  | "suporte"
  | "misto";
export type ContratoFrequencia =
  | "unica"
  | "mensal"
  | "trimestral"
  | "semestral"
  | "anual";

export const CONTRATO_TIPO_LABEL: Record<ContratoTipo, string> = {
  venda_instalacao: "Venda + instalação",
  locacao: "Locação",
  assinatura: "Assinatura",
  suporte: "Suporte",
  misto: "Misto",
};

export const CONTRATO_FREQUENCIA_LABEL: Record<ContratoFrequencia, string> = {
  unica: "Pagamento único",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export interface Contrato {
  id: ID;
  numero: string;
  clienteId: ID;
  pedidoId?: ID;
  inicio: string;
  fim: string;
  valorMensal: number;
  indexador: ContratoIndexador;
  tipo: ContratoTipo;
  frequencia: ContratoFrequencia;
  proximoReajuste?: string;
  status: ContratoStatus;
  descricao?: string;
  criadoEm: string;
}

// ---------- Ativos ----------
export type AtivoStatus = "ativo" | "manutencao" | "baixado";
export interface Ativo {
  id: ID;
  tag: string;
  modelo: string;
  tipo: string;
  clienteId?: ID;
  localizacao?: string;
  status: AtivoStatus;
  ultimaLeitura?: string;
  instaladoEm?: string;
  observacao?: string;
}

// ---------- Ordens de Serviço ----------
export type OSStatus =
  | "aberta"
  | "agendada"
  | "em_rota"
  | "em_execucao"
  | "aguardando_pecas"
  | "concluida"
  | "cancelada"
  | "retorno_necessario";
export type OSPrioridade = "baixa" | "media" | "alta" | "critica";
export const OS_STATUS: { id: OSStatus; label: string }[] = [
  { id: "aberta", label: "Aberta" },
  { id: "agendada", label: "Agendada" },
  { id: "em_rota", label: "Em rota" },
  { id: "em_execucao", label: "Em execução" },
  { id: "aguardando_pecas", label: "Aguardando peças" },
  { id: "concluida", label: "Concluída" },
  { id: "cancelada", label: "Cancelada" },
  { id: "retorno_necessario", label: "Retorno necessário" },
];
export interface OSTarefa {
  id: ID;
  descricao: string;
  feita: boolean;
}
export interface OS {
  id: ID;
  numero: string;
  titulo: string;
  clienteId: ID;
  prioridade: OSPrioridade;
  status: OSStatus;
  tecnico?: string;
  endereco?: string;
  sla?: string;
  tarefas: OSTarefa[];
  ativosIds: ID[];
  horasGastas?: number;
  observacao?: string;
  pedidoId?: ID;
  contratoId?: ID;
  ticketId?: ID;
  criadoEm: string;
  concluidaEm?: string;
}

// ---------- Estoque ----------
export type MovTipo = "entrada" | "saida" | "ajuste" | "reserva";
export interface Movimentacao {
  id: ID;
  itemId: ID;
  tipo: MovTipo;
  quantidade: number;
  motivo?: string;
  osId?: ID;
  criadoEm: string;
}

// ---------- Financeiro ----------
export type LancamentoTipo = "receber" | "pagar";
export type LancamentoStatus = "aberto" | "parcial" | "pago" | "cancelado";
export type LancamentoOrigem = "contrato" | "pedido" | "manual";
export interface Lancamento {
  id: ID;
  tipo: LancamentoTipo;
  descricao: string;
  clienteId?: ID;
  fornecedor?: string;
  valor: number;
  valorPago?: number;
  vencimento: string;
  pagoEm?: string;
  status: LancamentoStatus;
  origem: LancamentoOrigem;
  contratoId?: ID;
  pedidoId?: ID;
  criadoEm: string;
}

/** Status efetivo derivado para exibição (inclui "vencido" calculado por data). */
export type LancamentoStatusVisual = LancamentoStatus | "vencido";

// ---------- Suporte ----------
export type TicketStatus = "novo" | "andamento" | "aguardando" | "resolvido";
export type TicketPrioridade = "baixa" | "media" | "alta" | "critica";
export type TicketCanal = "email" | "whatsapp" | "portal" | "telefone";
export interface TicketMensagem {
  id: ID;
  autor: string;
  interno: boolean;
  texto: string;
  criadoEm: string;
}
export interface Ticket {
  id: ID;
  numero: string;
  assunto: string;
  clienteId: ID;
  canal: TicketCanal;
  prioridade: TicketPrioridade;
  status: TicketStatus;
  sla?: string;
  mensagens: TicketMensagem[];
  osId?: ID;
  criadoEm: string;
}
