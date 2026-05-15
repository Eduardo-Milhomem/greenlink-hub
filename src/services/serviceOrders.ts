import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ServiceOrder, ServiceOrderTask } from "@/types/serviceOrder";

type ServiceOrderRow = Database["public"]["Tables"]["service_orders"]["Row"];
type ServiceOrderInsert = Database["public"]["Tables"]["service_orders"]["Insert"];
type ServiceOrderUpdate = Database["public"]["Tables"]["service_orders"]["Update"];
type ServiceOrderTaskRow = Database["public"]["Tables"]["service_order_tasks"]["Row"];
type ServiceOrderTaskInsert = Database["public"]["Tables"]["service_order_tasks"]["Insert"];

const mapTask = (row: ServiceOrderTaskRow): ServiceOrderTask => ({
  id: row.id,
  serviceOrderId: row.service_order_id,
  title: row.title,
  status: row.status === "done" ? "done" : "pending",
  sortOrder: row.sort_order,
  completedAt: row.completed_at ?? undefined,
});

const mapServiceOrder = (
  row: ServiceOrderRow & { service_order_tasks?: ServiceOrderTaskRow[] | null },
): ServiceOrder => ({
  id: row.id,
  osNumber: row.os_number,
  customerId: row.customer_id,
  contractId: row.contract_id ?? undefined,
  assetId: row.asset_id ?? undefined,
  orderId: row.order_id ?? undefined,
  ticketId: row.ticket_id ?? undefined,
  serviceType: row.service_type,
  priority: row.priority,
  status: row.status,
  scheduledStart: row.scheduled_start ?? undefined,
  scheduledEnd: row.scheduled_end ?? undefined,
  completedAt: row.completed_at ?? undefined,
  siteAddressId: undefined,
  description: row.description ?? undefined,
  createdBy: row.created_by ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  tasks: (row.service_order_tasks ?? []).map(mapTask),
});

const buildServiceOrderPayload = (data: Partial<ServiceOrder>): ServiceOrderInsert | ServiceOrderUpdate => ({
  os_number: data.osNumber,
  customer_id: data.customerId,
  contract_id: data.contractId ?? null,
  asset_id: data.assetId ?? null,
  order_id: data.orderId ?? null,
  ticket_id: data.ticketId ?? null,
  service_type: data.serviceType,
  priority: data.priority,
  status: data.status,
  scheduled_start: data.scheduledStart ?? null,
  scheduled_end: data.scheduledEnd ?? null,
  completed_at: data.completedAt ?? null,
  description: data.description ?? null,
  assigned_to: data.assignedTo ?? null,
});

export const serviceOrderService = {
  list: async (): Promise<ServiceOrder[]> => {
    const { data, error } = await supabase
      .from("service_orders")
      .select("*, service_order_tasks(*)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapServiceOrder(row as any));
  },

  get: async (id: string): Promise<ServiceOrder | undefined> => {
    const { data, error } = await supabase
      .from("service_orders")
      .select("*, service_order_tasks(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapServiceOrder(data as any) : undefined;
  },

  create: async (data: Partial<ServiceOrder>) => {
    const now = new Date();
    const osNumber =
      data.osNumber ??
      `OS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

    const { data: created, error } = await supabase
      .from("service_orders")
      .insert({
        os_number: osNumber,
        customer_id: data.customerId!,
        contract_id: data.contractId ?? null,
        asset_id: data.assetId ?? null,
        order_id: data.orderId ?? null,
        ticket_id: data.ticketId ?? null,
        service_type: data.serviceType ?? "maintenance",
        priority: data.priority ?? "medium",
        status: data.status ?? "open",
        scheduled_start: data.scheduledStart ?? null,
        scheduled_end: data.scheduledEnd ?? null,
        description: data.description ?? null,
        assigned_to: data.assignedTo ?? null,
      })
      .select("*, service_order_tasks(*)")
      .single();
    if (error) throw error;
    return mapServiceOrder(created as any);
  },

  update: async (id: string, data: Partial<ServiceOrder>) => {
    const { data: updated, error } = await supabase
      .from("service_orders")
      .update(buildServiceOrderPayload(data))
      .eq("id", id)
      .select("*, service_order_tasks(*)")
      .single();
    if (error) throw error;
    return mapServiceOrder(updated as any);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("service_orders").delete().eq("id", id);
    if (error) throw error;
  },

  listTasks: async (osId: string) => {
    const { data, error } = await supabase
      .from("service_order_tasks")
      .select("*")
      .eq("service_order_id", osId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapTask);
  },

  addTask: async (osId: string, title: string) => {
    const { data: existing, error: existingError } = await supabase
      .from("service_order_tasks")
      .select("sort_order")
      .eq("service_order_id", osId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;

    const payload: ServiceOrderTaskInsert = {
      service_order_id: osId,
      title,
      status: "pending",
      sort_order: (existing?.sort_order ?? 0) + 1,
      completed_at: null,
    };

    const { data, error } = await supabase.from("service_order_tasks").insert(payload).select().single();
    if (error) throw error;
    return mapTask(data);
  },

  toggleTask: async (osId: string, taskId: string) => {
    const { data: task, error: loadError } = await supabase
      .from("service_order_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("service_order_id", osId)
      .single();
    if (loadError) throw loadError;

    const nextStatus = task.status === "done" ? "pending" : "done";
    const nextCompletedAt = nextStatus === "done" ? new Date().toISOString() : null;

    const { data: updated, error } = await supabase
      .from("service_order_tasks")
      .update({ status: nextStatus, completed_at: nextCompletedAt })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw error;
    return mapTask(updated);
  },
};
