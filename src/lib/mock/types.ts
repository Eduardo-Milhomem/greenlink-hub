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
  | "novo" | "qualificado" | "proposta" | "negociacao" | "ganho" | "perdido";
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
  status: "aberto" | "concluido" | "cancelado";
}
