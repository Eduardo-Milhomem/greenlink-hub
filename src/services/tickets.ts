import { useAppStore } from "@/lib/mock/store";
import { SupportTicket, type TicketPriority, type TicketStatus } from "@/types/ticket";
import type {
  TicketPrioridade,
  TicketStatus as MockTicketStatus,
  TicketCanal,
} from "@/lib/mock/types";

const prioridadeToDomain: Record<TicketPrioridade, TicketPriority> = {
  baixa: "low",
  media: "medium",
  alta: "high",
  critica: "urgent",
};

const domainToPrioridade: Record<TicketPriority, TicketPrioridade> = {
  low: "baixa",
  medium: "media",
  high: "alta",
  urgent: "critica",
};

const statusToDomain: Record<MockTicketStatus, Exclude<TicketStatus, "cancelled">> = {
  novo: "new",
  andamento: "in_progress",
  aguardando: "waiting_customer",
  resolvido: "resolved",
};

const domainToStatus: Record<TicketStatus, MockTicketStatus> = {
  new: "novo",
  in_progress: "andamento",
  waiting_customer: "aguardando",
  resolved: "resolvido",
  cancelled: "resolvido",
};

const isTicketCanal = (v: string | undefined): v is TicketCanal =>
  v === "email" || v === "whatsapp" || v === "portal" || v === "telefone";

export const ticketService = {
  list: async (): Promise<SupportTicket[]> => {
    const tickets = useAppStore.getState().tickets;
    return tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.numero,
      customerId: t.clienteId,
      subject: t.assunto,
      channel: t.canal,
      priority: prioridadeToDomain[t.prioridade],
      status: statusToDomain[t.status],
      slaDueAt: t.sla,
      createdAt: t.criadoEm,
      updatedAt: t.criadoEm,
      messages: t.mensagens.map((m) => ({
        id: m.id,
        ticketId: t.id,
        isInternal: m.interno,
        body: m.texto,
        createdAt: m.criadoEm,
        authorUserId: m.autor,
      })),
    }));
  },

  get: async (id: string): Promise<SupportTicket | undefined> => {
    const tickets = await ticketService.list();
    return tickets.find((t) => t.id === id);
  },

  create: async (data: Partial<SupportTicket>) => {
    const addTicket = useAppStore.getState().addTicket;
    addTicket({
      assunto: data.subject!,
      clienteId: data.customerId!,
      canal: isTicketCanal(data.channel) ? data.channel : "portal",
      prioridade: data.priority ? domainToPrioridade[data.priority] : "media",
      status: data.status ? domainToStatus[data.status] : "novo",
      sla: data.slaDueAt,
      mensagens: [],
    });
  },

  update: async (id: string, data: Partial<SupportTicket>) => {
    const updateTicket = useAppStore.getState().updateTicket;
    updateTicket(id, {
      assunto: data.subject,
      clienteId: data.customerId,
      canal: isTicketCanal(data.channel) ? data.channel : undefined,
      prioridade: data.priority ? domainToPrioridade[data.priority] : undefined,
      status: data.status ? domainToStatus[data.status] : undefined,
      sla: data.slaDueAt,
    });
  },

  addMessage: async (ticketId: string, author: string, text: string, internal: boolean = false) => {
    const addMessage = useAppStore.getState().addMensagemTicket;
    addMessage(ticketId, { autor: author, texto: text, interno: internal });
  },

  toServiceOrder: async (ticketId: string) => {
    const toOS = useAppStore.getState().ticketParaOS;
    toOS(ticketId);
  },

  remove: async (id: string) => {
    const remove = useAppStore.getState().removeTicket;
    remove(id);
  },
};
