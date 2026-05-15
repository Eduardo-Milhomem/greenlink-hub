import type { BillingStatus } from "@/types/contract";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Payable, Receivable } from "@/types/finance";

type ReceivableRow = Database["public"]["Tables"]["receivables"]["Row"];
type ReceivableInsert = Database["public"]["Tables"]["receivables"]["Insert"];
type PayableRow = Database["public"]["Tables"]["payables"]["Row"];
type PayableInsert = Database["public"]["Tables"]["payables"]["Insert"];

const toBillingStatus = (status: Exclude<BillingStatus, "overdue">, dueDateIso: string): BillingStatus => {
  const base = status;
  const isOpen = base === "open" || base === "partial";
  const isOverdue = isOpen && new Date(dueDateIso).getTime() < Date.now();
  return isOverdue ? "overdue" : base;
};

const mapReceivable = (row: ReceivableRow): Receivable => ({
  id: row.id,
  description: row.description,
  customerId: row.customer_id,
  contractId: row.contract_id ?? undefined,
  orderId: row.order_id ?? undefined,
  categoryId: row.category_id ?? undefined,
  costCenterId: row.cost_center_id ?? undefined,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  amount: Number(row.amount) || 0,
  openAmount: Number(row.open_amount) || 0,
  status: toBillingStatus(row.status, row.due_date),
  originType: row.origin_type ?? undefined,
  originId: row.origin_id ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapPayable = (row: PayableRow): Payable => ({
  id: row.id,
  description: row.description,
  supplierId: row.supplier_id ?? undefined,
  categoryId: row.category_id ?? undefined,
  costCenterId: row.cost_center_id ?? undefined,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  amount: Number(row.amount) || 0,
  openAmount: Number(row.open_amount) || 0,
  status: toBillingStatus(row.status, row.due_date),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const financeService = {
  listReceivables: async (): Promise<Receivable[]> => {
    const { data, error } = await supabase.from("receivables").select("*").order("due_date");
    if (error) throw error;
    return (data ?? []).map(mapReceivable);
  },

  listPayables: async (): Promise<Payable[]> => {
    const { data, error } = await supabase.from("payables").select("*").order("due_date");
    if (error) throw error;
    return (data ?? []).map(mapPayable);
  },

  createReceivable: async (data: Partial<Receivable>) => {
    const payload: ReceivableInsert = {
      description: data.description!,
      customer_id: data.customerId!,
      contract_id: data.contractId ?? null,
      order_id: data.orderId ?? null,
      category_id: data.categoryId ?? null,
      cost_center_id: data.costCenterId ?? null,
      issue_date: (data.issueDate ?? new Date().toISOString().slice(0, 10)) as any,
      due_date: data.dueDate as any,
      amount: data.amount!,
      open_amount: data.openAmount ?? data.amount!,
      status: data.status === "overdue" ? "open" : ((data.status ?? "open") as any),
      origin_type: data.originType ?? null,
      origin_id: data.originId ?? null,
    };
    const { data: created, error } = await supabase.from("receivables").insert(payload).select().single();
    if (error) throw error;
    return mapReceivable(created);
  },

  createPayable: async (data: Partial<Payable>) => {
    const payload: PayableInsert = {
      description: data.description!,
      supplier_id: data.supplierId ?? null,
      category_id: data.categoryId ?? null,
      cost_center_id: data.costCenterId ?? null,
      issue_date: (data.issueDate ?? new Date().toISOString().slice(0, 10)) as any,
      due_date: data.dueDate as any,
      amount: data.amount!,
      open_amount: data.openAmount ?? data.amount!,
      status: data.status === "overdue" ? "open" : ((data.status ?? "open") as any),
    };
    const { data: created, error } = await supabase.from("payables").insert(payload).select().single();
    if (error) throw error;
    return mapPayable(created);
  },

  receive: async (id: string, amount: number) => {
    const { data: row, error: loadError } = await supabase.from("receivables").select("*").eq("id", id).single();
    if (loadError) throw loadError;

    const nextOpen = Math.max(0, Number(row.open_amount) - amount);
    const nextStatus: Exclude<BillingStatus, "overdue"> = nextOpen <= 0 ? "paid" : "partial";
    const { data: updated, error } = await supabase
      .from("receivables")
      .update({ open_amount: nextOpen, status: nextStatus })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapReceivable(updated);
  },

  pay: async (id: string, _amount: number) => {
    const { data: row, error: loadError } = await supabase.from("payables").select("*").eq("id", id).single();
    if (loadError) throw loadError;

    const nextOpen = 0;
    const { data: updated, error } = await supabase
      .from("payables")
      .update({ open_amount: nextOpen, status: "paid" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapPayable(updated);
  },

  remove: async (id: string) => {
    const { error: rError } = await supabase.from("receivables").delete().eq("id", id);
    if (rError && rError.code !== "PGRST116") throw rError;
    const { error: pError } = await supabase.from("payables").delete().eq("id", id);
    if (pError && pError.code !== "PGRST116") throw pError;
  },
};
