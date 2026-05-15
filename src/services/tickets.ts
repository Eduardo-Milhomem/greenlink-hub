import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { SupportTicket, TicketMessage, TicketPriority, TicketStatus } from "@/types/ticket";

type TicketRow = Database["public"]["Tables"]["support_tickets"]["Row"];
type TicketInsert = Database["public"]["Tables"]["support_tickets"]["Insert"];
type TicketUpdate = Database["public"]["Tables"]["support_tickets"]["Update"];
type TicketMessageRow = Database["public"]["Tables"]["ticket_messages"]["Row"];

type TicketWithRelations = TicketRow & { ticket_messages?: TicketMessageRow[] | null };

const mapMessage = (row: TicketMessageRow): TicketMessage => ({
  id: row.id,
  ticketId: row.ticket_id,
  authorUserId: row.author_user_id ?? undefined,
  authorContactId: undefined,
  isInternal: !!row.is_internal,
  body: row.body,
  createdAt: row.created_at,
});

const mapTicket = (row: TicketWithRelations): SupportTicket => ({
  id: row.id,
  ticketNumber: row.ticket_number,
  customerId: row.customer_id,
  contractId: row.contract_id ?? undefined,
  assetId: row.asset_id ?? undefined,
  channel: row.channel ?? undefined,
  subject: row.subject,
  description: row.description ?? undefined,
  category: row.category ?? undefined,
  priority: row.priority,
  status: row.status,
  slaDueAt: row.sla_due_at ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  openedByContactId: undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  resolvedAt: row.resolved_at ?? undefined,
  messages: (row.ticket_messages ?? []).map(mapMessage),
});

const buildTicketPayload = (data: Partial<SupportTicket>): TicketInsert | TicketUpdate => ({
  ticket_number: data.ticketNumber,
  customer_id: data.customerId,
  contract_id: data.contractId ?? null,
  asset_id: data.assetId ?? null,
  channel: data.channel ?? null,
  subject: data.subject,
  description: data.description ?? null,
  category: data.category ?? null,
  priority: data.priority as TicketPriority,
  status: data.status as TicketStatus,
  sla_due_at: data.slaDueAt ?? null,
  assigned_to: data.assignedTo ?? null,
  resolved_at: data.resolvedAt ?? null,
});

export const ticketService = {
  list: async (): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, ticket_messages!fk_tm_ticket(*)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapTicket(row as unknown as TicketWithRelations));
  },

  get: async (id: string): Promise<SupportTicket | undefined> => {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, ticket_messages!fk_tm_ticket(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapTicket(data as unknown as TicketWithRelations) : undefined;
  },

  create: async (data: Partial<SupportTicket>) => {
    const now = new Date();
    const ticketNumber =
      data.ticketNumber ??
      `TK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

    const { data: created, error } = await supabase
      .from("support_tickets")
      .insert({
        ticket_number: ticketNumber,
        customer_id: data.customerId!,
        contract_id: data.contractId ?? null,
        asset_id: data.assetId ?? null,
        channel: data.channel ?? "portal",
        subject: data.subject!,
        description: data.description ?? null,
        category: data.category ?? null,
        priority: data.priority ?? "medium",
        status: data.status ?? "new",
        sla_due_at: data.slaDueAt ?? null,
        assigned_to: data.assignedTo ?? null,
      })
      .select("*, ticket_messages!fk_tm_ticket(*)")
      .single();
    if (error) throw error;
    return mapTicket(created as unknown as TicketWithRelations);
  },

  update: async (id: string, data: Partial<SupportTicket>) => {
    const { data: updated, error } = await supabase
      .from("support_tickets")
      .update(buildTicketPayload(data))
      .eq("id", id)
      .select("*, ticket_messages!fk_tm_ticket(*)")
      .single();
    if (error) throw error;
    return mapTicket(updated as unknown as TicketWithRelations);
  },

  addMessage: async (ticketId: string, author: string, text: string, internal: boolean = false) => {
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        author_user_id: author,
        is_internal: internal,
        body: text,
      })
      .select()
      .single();
    if (error) throw error;
    return mapMessage(data);
  },

  toServiceOrder: async (ticketId: string) => {
    const ticket = await ticketService.get(ticketId);
    if (!ticket) throw new Error("Ticket não encontrado");

    const now = new Date();
    const osNumber = `OS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

    const { data: os, error } = await supabase
      .from("service_orders")
      .insert({
        os_number: osNumber,
        customer_id: ticket.customerId,
        contract_id: ticket.contractId ?? null,
        asset_id: ticket.assetId ?? null,
        ticket_id: ticket.id,
        service_type: "support",
        priority: ticket.priority,
        status: "open",
        description: ticket.subject,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", ticket.id);
    return os;
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("support_tickets").delete().eq("id", id);
    if (error) throw error;
  },
};
