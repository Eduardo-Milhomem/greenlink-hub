import { useAppStore } from "@/lib/mock/store";
import {
  Contract,
  type ContractItem,
  type ContractType,
  type ContractStatus,
  type BillingFrequency,
} from "@/types/contract";
import type {
  ContratoTipo,
  ContratoStatus as MockContratoStatus,
  ContratoFrequencia,
  ContratoIndexador,
} from "@/lib/mock/types";

const contratoTipoToDomain: Record<ContratoTipo, ContractType> = {
  venda_instalacao: "sale_installation",
  locacao: "rental",
  assinatura: "subscription",
  suporte: "support",
  misto: "mixed",
};

const domainToContratoTipo: Record<ContractType, ContratoTipo> = {
  sale_installation: "venda_instalacao",
  rental: "locacao",
  subscription: "assinatura",
  support: "suporte",
  mixed: "misto",
};

const contratoStatusToDomain: Record<MockContratoStatus, ContractStatus> = {
  ativo: "active",
  suspenso: "suspended",
  encerrado: "expired",
};

const domainToContratoStatus: Record<ContractStatus, MockContratoStatus> = {
  draft: "ativo",
  active: "ativo",
  suspended: "suspenso",
  expired: "encerrado",
  cancelled: "encerrado",
};

const contratoFreqToDomain: Record<ContratoFrequencia, BillingFrequency> = {
  unica: "one_time",
  mensal: "monthly",
  trimestral: "quarterly",
  semestral: "semiannual",
  anual: "annual",
};

const domainToContratoFreq: Record<BillingFrequency, ContratoFrequencia> = {
  one_time: "unica",
  monthly: "mensal",
  quarterly: "trimestral",
  semiannual: "semestral",
  annual: "anual",
};

const isContratoIndexador = (v: string | undefined): v is ContratoIndexador =>
  v === "ipca" || v === "igpm" || v === "fixo";

export const contractService = {
  list: async (): Promise<Contract[]> => {
    const contracts = useAppStore.getState().contratos;
    return contracts.map((c) => ({
      id: c.id,
      contractNumber: c.numero,
      customerId: c.clienteId,
      orderId: c.pedidoId,
      contractType: contratoTipoToDomain[c.tipo],
      status: contratoStatusToDomain[c.status],
      startDate: c.inicio,
      endDate: c.fim,
      billingFrequency: contratoFreqToDomain[c.frequencia],
      monthlyAmount: c.valorMensal,
      priceIndexer: c.indexador,
      autoRenew: false,
      notes: c.descricao,
      createdAt: c.criadoEm,
      updatedAt: c.criadoEm,
      items: [],
    }));
  },

  get: async (id: string): Promise<Contract | undefined> => {
    const contracts = await contractService.list();
    return contracts.find((c) => c.id === id);
  },

  create: async (data: Partial<Contract>) => {
    const addContrato = useAppStore.getState().addContrato;
    addContrato({
      clienteId: data.customerId!,
      pedidoId: data.orderId,
      inicio: data.startDate!,
      fim: data.endDate!,
      valorMensal: data.monthlyAmount || 0,
      indexador: isContratoIndexador(data.priceIndexer) ? data.priceIndexer : "fixo",
      tipo: data.contractType ? domainToContratoTipo[data.contractType] : "locacao",
      frequencia: data.billingFrequency ? domainToContratoFreq[data.billingFrequency] : "mensal",
      status: data.status ? domainToContratoStatus[data.status] : "ativo",
      descricao: data.notes,
    });
  },

  update: async (id: string, data: Partial<Contract>) => {
    const updateContrato = useAppStore.getState().updateContrato;
    updateContrato(id, {
      numero: data.contractNumber,
      clienteId: data.customerId,
      pedidoId: data.orderId,
      inicio: data.startDate,
      fim: data.endDate,
      valorMensal: data.monthlyAmount,
      indexador: isContratoIndexador(data.priceIndexer) ? data.priceIndexer : undefined,
      tipo: data.contractType ? domainToContratoTipo[data.contractType] : undefined,
      frequencia: data.billingFrequency ? domainToContratoFreq[data.billingFrequency] : undefined,
      status: data.status ? domainToContratoStatus[data.status] : undefined,
      descricao: data.notes,
    });
  },

  remove: async (id: string) => {
    const removeContrato = useAppStore.getState().removeContrato;
    removeContrato(id);
  },

  bill: async (id: string) => {
    const faturar = useAppStore.getState().faturarContrato;
    faturar(id);
  },

  /**
   * Processa faturamento em lote para todos os contratos ativos que ainda não
   * foram faturados no mês de referência.
   */
  processBatchBilling: async (monthRef: string): Promise<number> => {
    const store = useAppStore.getState();
    const activeContracts = store.contratos.filter((c) => c.status === "ativo");
    let count = 0;

    activeContracts.forEach((ct) => {
      // Verifica se já existe um lançamento para este contrato neste mês de referência
      const alreadyBilled = store.lancamentos.some(
        (l) => l.contratoId === ct.id && l.vencimento.startsWith(monthRef),
      );

      if (!alreadyBilled) {
        store.faturarContrato(ct.id);
        count++;
      }
    });

    return count;
  },

  listItems: async (contractId: string): Promise<ContractItem[]> => {
    // Simulando itens de contrato que hoje não existem no mock centralizado
    // Em um backend real, haveria uma tabela contract_items
    return [];
  },

  addItems: async (contractId: string, items: ContractItem[]) => {
    console.log("Add items to contract", contractId, items);
  },
};
