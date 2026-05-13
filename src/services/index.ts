import { useAppStore } from "@/lib/mock/store";

/**
 * Camada de serviços por domínio.
 *
 * Hoje delega ao mock store via Zustand; a interface é estável o bastante para
 * trocar a implementação por chamadas HTTP reais sem alterar a UI.
 */
export const services = {
  customers: {
    list: () => useAppStore.getState().clientes,
    get: (id: string) => useAppStore.getState().clientes.find((c) => c.id === id),
    create: useAppStore.getState().addCliente,
    update: useAppStore.getState().updateCliente,
    remove: useAppStore.getState().removeCliente,
  },
  leads: {
    list: () => useAppStore.getState().leads,
    create: useAppStore.getState().addLead,
    update: useAppStore.getState().updateLead,
    remove: useAppStore.getState().removeLead,
    convert: useAppStore.getState().converterLead,
  },
  opportunities: {
    list: () => useAppStore.getState().oportunidades,
    create: useAppStore.getState().addOportunidade,
    update: useAppStore.getState().updateOportunidade,
    move: useAppStore.getState().moverOportunidade,
    remove: useAppStore.getState().removeOportunidade,
  },
  catalog: {
    list: () => useAppStore.getState().catalogo,
    create: useAppStore.getState().addItemCatalogo,
    update: useAppStore.getState().updateItemCatalogo,
    remove: useAppStore.getState().removeItemCatalogo,
  },
  quotes: {
    list: () => useAppStore.getState().orcamentos,
    get: (id: string) => useAppStore.getState().orcamentos.find((o) => o.id === id),
    create: useAppStore.getState().addOrcamento,
    update: useAppStore.getState().updateOrcamento,
    remove: useAppStore.getState().removeOrcamento,
    send: useAppStore.getState().enviarOrcamento,
    approve: useAppStore.getState().aprovarOrcamento,
    reject: useAppStore.getState().recusarOrcamento,
    generateOrder: useAppStore.getState().gerarPedidoDeOrcamento,
  },
  orders: {
    list: () => useAppStore.getState().pedidos,
    get: (id: string) => useAppStore.getState().pedidos.find((p) => p.id === id),
    setStatus: useAppStore.getState().atualizarStatusPedido,
  },
  contracts: {
    list: () => useAppStore.getState().contratos,
    get: (id: string) => useAppStore.getState().contratos.find((c) => c.id === id),
    create: useAppStore.getState().addContrato,
    update: useAppStore.getState().updateContrato,
    remove: useAppStore.getState().removeContrato,
    bill: useAppStore.getState().faturarContrato,
  },
  assets: {
    list: () => useAppStore.getState().ativos,
    get: (id: string) => useAppStore.getState().ativos.find((a) => a.id === id),
    create: useAppStore.getState().addAtivo,
    update: useAppStore.getState().updateAtivo,
    remove: useAppStore.getState().removeAtivo,
  },
  serviceOrders: {
    list: () => useAppStore.getState().ordens,
    get: (id: string) => useAppStore.getState().ordens.find((o) => o.id === id),
    create: useAppStore.getState().addOS,
    update: useAppStore.getState().updateOS,
    toggleTask: useAppStore.getState().toggleTarefa,
    finish: useAppStore.getState().concluirOS,
    remove: useAppStore.getState().removeOS,
  },
  tickets: {
    list: () => useAppStore.getState().tickets,
    get: (id: string) => useAppStore.getState().tickets.find((t) => t.id === id),
    create: useAppStore.getState().addTicket,
    update: useAppStore.getState().updateTicket,
    addMessage: useAppStore.getState().addMensagemTicket,
    toServiceOrder: useAppStore.getState().ticketParaOS,
    remove: useAppStore.getState().removeTicket,
  },
  inventory: {
    movements: () => useAppStore.getState().movimentacoes,
    addMovement: useAppStore.getState().addMovimentacao,
  },
  finance: {
    list: () => useAppStore.getState().lancamentos,
    create: useAppStore.getState().addLancamento,
    pay: useAppStore.getState().pagarLancamento,
    receive: useAppStore.getState().registrarRecebimento,
    revert: useAppStore.getState().estornar,
    remove: useAppStore.getState().removeLancamento,
  },
};

export type Services = typeof services;