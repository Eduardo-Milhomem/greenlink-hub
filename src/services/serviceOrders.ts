import { useAppStore } from "@/lib/mock/store";
import { ServiceOrder, type ServicePriority, type ServiceOrderStatus } from "@/types/serviceOrder";
import type { OSStatus, OSPrioridade } from "@/lib/mock/types";

const osPrioridadeToDomain: Record<OSPrioridade, ServicePriority> = {
  baixa: "low",
  media: "medium",
  alta: "high",
  critica: "urgent",
};

const domainToOsPrioridade: Record<ServicePriority, OSPrioridade> = {
  low: "baixa",
  medium: "media",
  high: "alta",
  urgent: "critica",
};

const osStatusToDomain: Record<OSStatus, ServiceOrderStatus> = {
  aberta: "open",
  agendada: "scheduled",
  em_rota: "in_route",
  em_execucao: "in_progress",
  aguardando_pecas: "waiting_parts",
  concluida: "done",
  cancelada: "cancelled",
  retorno_necessario: "return_required",
};

const domainToOsStatus: Record<ServiceOrderStatus, OSStatus> = {
  open: "aberta",
  scheduled: "agendada",
  in_route: "em_rota",
  in_progress: "em_execucao",
  waiting_parts: "aguardando_pecas",
  done: "concluida",
  cancelled: "cancelada",
  return_required: "retorno_necessario",
};

export const serviceOrderService = {
  list: async (): Promise<ServiceOrder[]> => {
    const orders = useAppStore.getState().ordens;
    return orders.map((o) => ({
      id: o.id,
      osNumber: o.numero,
      customerId: o.clienteId,
      contractId: o.contratoId,
      orderId: o.pedidoId,
      ticketId: o.ticketId,
      serviceType: "maintenance",
      priority: osPrioridadeToDomain[o.prioridade],
      status: osStatusToDomain[o.status],
      description: o.titulo,
      assignedTo: o.tecnico,
      createdAt: o.criadoEm,
      updatedAt: o.criadoEm,
      completedAt: o.concluidaEm,
      tasks: o.tarefas.map((t) => ({
        id: t.id,
        serviceOrderId: o.id,
        title: t.descricao,
        status: t.feita ? "done" : "pending",
        sortOrder: 0,
        completedAt: t.feita ? o.concluidaEm : undefined,
      })),
    }));
  },

  get: async (id: string): Promise<ServiceOrder | undefined> => {
    const orders = await serviceOrderService.list();
    return orders.find((o) => o.id === id);
  },

  create: async (data: Partial<ServiceOrder>) => {
    const addOS = useAppStore.getState().addOS;
    addOS({
      titulo: data.description!,
      clienteId: data.customerId!,
      prioridade: data.priority ? domainToOsPrioridade[data.priority] : "media",
      status: data.status ? domainToOsStatus[data.status] : "aberta",
      tecnico: data.assignedTo,
      contratoId: data.contractId,
      pedidoId: data.orderId,
      ticketId: data.ticketId,
      tarefas: [],
      ativosIds: [],
    });
  },

  update: async (id: string, data: Partial<ServiceOrder>) => {
    const updateOS = useAppStore.getState().updateOS;
    updateOS(id, {
      titulo: data.description,
      clienteId: data.customerId,
      prioridade: data.priority ? domainToOsPrioridade[data.priority] : undefined,
      status: data.status ? domainToOsStatus[data.status] : undefined,
      tecnico: data.assignedTo,
    });
  },

  remove: async (id: string) => {
    const remove = useAppStore.getState().removeOS;
    remove(id);
  },

  listTasks: async (osId: string) => {
    const os = await serviceOrderService.get(osId);
    return os?.tasks || [];
  },

  addTask: async (osId: string, title: string) => {
    const update = useAppStore.getState().updateOS;
    const os = useAppStore.getState().ordens.find((o) => o.id === osId);
    if (!os) return;
    update(osId, {
      tarefas: [
        ...os.tarefas,
        { id: Math.random().toString(36).slice(2, 8), descricao: title, feita: false },
      ],
    });
  },

  toggleTask: async (osId: string, taskId: string) => {
    const toggle = useAppStore.getState().toggleTarefa;
    toggle(osId, taskId);
  },
};
