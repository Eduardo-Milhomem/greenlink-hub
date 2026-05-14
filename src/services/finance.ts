import { useAppStore } from "@/lib/mock/store";
import { Receivable, Payable } from "@/types/finance";
import type { BillingStatus } from "@/types/contract";
import type { LancamentoStatus, LancamentoOrigem } from "@/lib/mock/types";

const lancamentoStatusToBillingStatus: Record<
  LancamentoStatus,
  Exclude<BillingStatus, "overdue">
> = {
  aberto: "open",
  parcial: "partial",
  pago: "paid",
  cancelado: "cancelled",
};

const billingStatusToLancamentoStatus: Record<BillingStatus, LancamentoStatus> = {
  open: "aberto",
  partial: "parcial",
  paid: "pago",
  overdue: "aberto",
  cancelled: "cancelado",
};

const isLancamentoOrigem = (v: string | undefined): v is LancamentoOrigem =>
  v === "contrato" || v === "pedido" || v === "manual";

const toBillingStatus = (status: LancamentoStatus, dueDateIso: string): BillingStatus => {
  const base = lancamentoStatusToBillingStatus[status];
  const isOpen = base === "open" || base === "partial";
  const isOverdue = isOpen && new Date(dueDateIso).getTime() < Date.now();
  return isOverdue ? "overdue" : base;
};

export const financeService = {
  listReceivables: async (): Promise<Receivable[]> => {
    const entries = useAppStore.getState().lancamentos;
    return entries
      .filter((e) => e.tipo === "receber")
      .map((e) => ({
        id: e.id,
        description: e.descricao,
        customerId: e.clienteId!,
        contractId: e.contratoId,
        orderId: e.pedidoId,
        issueDate: e.criadoEm,
        dueDate: e.vencimento,
        amount: e.valor,
        openAmount: e.valor - (e.valorPago || 0),
        status: toBillingStatus(e.status, e.vencimento),
        originType: e.origem,
        createdAt: e.criadoEm,
        updatedAt: e.criadoEm,
      }));
  },

  listPayables: async (): Promise<Payable[]> => {
    const entries = useAppStore.getState().lancamentos;
    return entries
      .filter((e) => e.tipo === "pagar")
      .map((e) => ({
        id: e.id,
        description: e.descricao,
        supplierId: undefined, // Mock
        issueDate: e.criadoEm,
        dueDate: e.vencimento,
        amount: e.valor,
        openAmount: e.valor - (e.valorPago || 0),
        status: toBillingStatus(e.status, e.vencimento),
        createdAt: e.criadoEm,
        updatedAt: e.criadoEm,
      }));
  },

  createReceivable: async (data: Partial<Receivable>) => {
    const add = useAppStore.getState().addLancamento;
    add({
      tipo: "receber",
      descricao: data.description!,
      clienteId: data.customerId,
      valor: data.amount!,
      vencimento: data.dueDate!,
      status: data.status ? billingStatusToLancamentoStatus[data.status] : "aberto",
      origem: isLancamentoOrigem(data.originType) ? data.originType : "manual",
      contratoId: data.contractId,
      pedidoId: data.orderId,
    });
  },

  createPayable: async (data: Partial<Payable>) => {
    const add = useAppStore.getState().addLancamento;
    add({
      tipo: "pagar",
      descricao: data.description!,
      valor: data.amount!,
      vencimento: data.dueDate!,
      status: data.status ? billingStatusToLancamentoStatus[data.status] : "aberto",
      origem: "manual",
    });
  },

  receive: async (id: string, amount: number) => {
    const receive = useAppStore.getState().registrarRecebimento;
    receive(id, amount);
  },

  pay: async (id: string, _amount: number) => {
    const pay = useAppStore.getState().pagarLancamento;
    pay(id);
  },

  remove: async (id: string) => {
    const remove = useAppStore.getState().removeLancamento;
    remove(id);
  },
};
