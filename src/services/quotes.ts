import { useAppStore } from "@/lib/mock/store";
import { Quote, type QuoteStatus } from "@/types/quote";
import type { OrcamentoStatus } from "@/lib/mock/types";

const orcamentoStatusToQuoteStatus: Record<OrcamentoStatus, QuoteStatus> = {
  rascunho: "draft",
  enviado: "sent",
  aprovado: "approved",
  recusado: "rejected",
  convertido: "approved",
};

const quoteStatusToOrcamentoStatus: Record<QuoteStatus, OrcamentoStatus> = {
  draft: "rascunho",
  sent: "enviado",
  approved: "aprovado",
  rejected: "recusado",
  expired: "enviado",
  cancelled: "recusado",
};

export const quoteService = {
  list: async (): Promise<Quote[]> => {
    const quotes = useAppStore.getState().orcamentos;
    return quotes.map((q) => ({
      id: q.id,
      quoteNumber: q.numero,
      customerId: q.clienteId,
      opportunityId: q.oportunidadeId,
      status: orcamentoStatusToQuoteStatus[q.status],
      issueDate: q.criadoEm,
      validUntil: q.validoAte,
      subtotal: 0, // Calculado se necessário
      discountAmount: q.desconto,
      totalAmount: 0, // Calculado se necessário
      notes: q.observacao,
      createdAt: q.criadoEm,
      updatedAt: q.criadoEm,
      items: q.itens.map((i) => ({
        id: i.itemId, // Mock ID
        quoteId: q.id,
        catalogItemId: i.itemId,
        itemDescription: i.nome,
        itemType: "product",
        quantity: i.quantidade,
        unitPrice: i.precoUnit,
        discountAmount: i.desconto,
        totalAmount: (i.precoUnit - i.desconto) * i.quantidade,
        sortOrder: 0,
      })),
    }));
  },

  get: async (id: string): Promise<Quote | undefined> => {
    const quotes = await quoteService.list();
    return quotes.find((q) => q.id === id);
  },

  create: async (data: Partial<Quote>) => {
    const addOrcamento = useAppStore.getState().addOrcamento;
    addOrcamento({
      clienteId: data.customerId!,
      oportunidadeId: data.opportunityId,
      itens: [],
      desconto: data.discountAmount || 0,
      observacao: data.notes,
      status: data.status ? quoteStatusToOrcamentoStatus[data.status] : "rascunho",
    });
  },

  update: async (id: string, data: Partial<Quote>) => {
    const updateOrcamento = useAppStore.getState().updateOrcamento;
    updateOrcamento(id, {
      numero: data.quoteNumber,
      clienteId: data.customerId,
      oportunidadeId: data.opportunityId,
      desconto: data.discountAmount,
      observacao: data.notes,
      status: data.status ? quoteStatusToOrcamentoStatus[data.status] : undefined,
    });
  },

  remove: async (id: string) => {
    const removeOrcamento = useAppStore.getState().removeOrcamento;
    removeOrcamento(id);
  },

  send: async (id: string) => {
    const enviarOrcamento = useAppStore.getState().enviarOrcamento;
    enviarOrcamento(id);
  },

  approve: async (id: string) => {
    const aprovarOrcamento = useAppStore.getState().aprovarOrcamento;
    aprovarOrcamento(id);
  },

  reject: async (id: string) => {
    const recusarOrcamento = useAppStore.getState().recusarOrcamento;
    recusarOrcamento(id);
  },

  generateOrder: async (id: string) => {
    const gerarPedido = useAppStore.getState().gerarPedidoDeOrcamento;
    gerarPedido(id);
  },
};
