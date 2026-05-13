import { useAppStore } from "@/lib/mock/store";

/**
 * Hooks por domínio que selecionam slices reativos do store.
 * UI deve preferir esses hooks ao invés de `useAppStore` direto.
 */
export const useCustomers = () => useAppStore((s) => s.clientes);
export const useLeads = () => useAppStore((s) => s.leads);
export const useOpportunities = () => useAppStore((s) => s.oportunidades);
export const useCatalog = () => useAppStore((s) => s.catalogo);
export const useQuotes = () => useAppStore((s) => s.orcamentos);
export const useOrders = () => useAppStore((s) => s.pedidos);
export const useContracts = () => useAppStore((s) => s.contratos);
export const useAssets = () => useAppStore((s) => s.ativos);
export const useServiceOrders = () => useAppStore((s) => s.ordens);
export const useTickets = () => useAppStore((s) => s.tickets);
export const useInventoryMovements = () => useAppStore((s) => s.movimentacoes);
export const useFinanceEntries = () => useAppStore((s) => s.lancamentos);

export const useCustomer = (id?: string) =>
  useAppStore((s) => (id ? s.clientes.find((c) => c.id === id) : undefined));
export const useQuote = (id?: string) =>
  useAppStore((s) => (id ? s.orcamentos.find((o) => o.id === id) : undefined));
export const useOrder = (id?: string) =>
  useAppStore((s) => (id ? s.pedidos.find((p) => p.id === id) : undefined));
export const useContract = (id?: string) =>
  useAppStore((s) => (id ? s.contratos.find((c) => c.id === id) : undefined));
export const useAsset = (id?: string) =>
  useAppStore((s) => (id ? s.ativos.find((a) => a.id === id) : undefined));
export const useServiceOrder = (id?: string) =>
  useAppStore((s) => (id ? s.ordens.find((o) => o.id === id) : undefined));
export const useTicket = (id?: string) =>
  useAppStore((s) => (id ? s.tickets.find((t) => t.id === id) : undefined));