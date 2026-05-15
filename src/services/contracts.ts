import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Contract, ContractItem } from "@/types/contract";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];
type ContractInsert = Database["public"]["Tables"]["contracts"]["Insert"];
type ContractUpdate = Database["public"]["Tables"]["contracts"]["Update"];
type ContractItemRow = Database["public"]["Tables"]["contract_items"]["Row"];
type ContractItemInsert = Database["public"]["Tables"]["contract_items"]["Insert"];

const mapContractItem = (row: ContractItemRow): ContractItem => ({
  id: row.id,
  contractId: row.contract_id,
  catalogItemId: row.catalog_item_id ?? undefined,
  description: row.description,
  quantity: Number(row.quantity) || 0,
  unitPrice: Number(row.unit_price) || 0,
  billingFrequency: row.billing_frequency ?? undefined,
  startDate: row.start_date ?? undefined,
  endDate: row.end_date ?? undefined,
  isRecurring: !!row.is_recurring,
});

const mapContract = (
  row: ContractRow & { contract_items?: ContractItemRow[] | null },
): Contract => ({
  id: row.id,
  contractNumber: row.contract_number,
  customerId: row.customer_id,
  orderId: row.order_id ?? undefined,
  contractType: row.contract_type,
  status: row.status,
  startDate: row.start_date,
  endDate: row.end_date ?? undefined,
  billingFrequency: row.billing_frequency ?? undefined,
  monthlyAmount: Number(row.monthly_amount) || 0,
  priceIndexer: row.price_indexer ?? undefined,
  autoRenew: !!row.auto_renew,
  notes: row.notes ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  items: (row.contract_items ?? []).map(mapContractItem),
});

const buildContractPayload = (data: Partial<Contract>): ContractInsert | ContractUpdate => ({
  contract_number: data.contractNumber,
  customer_id: data.customerId,
  order_id: data.orderId ?? null,
  contract_type: data.contractType,
  status: data.status,
  start_date: data.startDate,
  end_date: data.endDate ?? null,
  billing_frequency: data.billingFrequency,
  monthly_amount: data.monthlyAmount,
  price_indexer: data.priceIndexer ?? null,
  auto_renew: data.autoRenew,
  notes: data.notes ?? null,
});

export const contractService = {
  list: async (): Promise<Contract[]> => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, contract_items(*)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapContract(row as any));
  },

  get: async (id: string): Promise<Contract | undefined> => {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, contract_items(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapContract(data as any) : undefined;
  },

  create: async (data: Partial<Contract>) => {
    const { data: created, error } = await supabase
      .from("contracts")
      .insert({
        contract_number: data.contractNumber!,
        customer_id: data.customerId!,
        order_id: data.orderId ?? null,
        contract_type: data.contractType ?? "subscription",
        status: data.status ?? "draft",
        start_date: data.startDate!,
        end_date: data.endDate ?? null,
        billing_frequency: data.billingFrequency ?? "monthly",
        monthly_amount: data.monthlyAmount ?? 0,
        price_indexer: data.priceIndexer ?? null,
        auto_renew: data.autoRenew ?? false,
        notes: data.notes ?? null,
      })
      .select("*, contract_items(*)")
      .single();
    if (error) throw error;
    return mapContract(created as any);
  },

  update: async (id: string, data: Partial<Contract>) => {
    const { data: updated, error } = await supabase
      .from("contracts")
      .update(buildContractPayload(data))
      .eq("id", id)
      .select("*, contract_items(*)")
      .single();
    if (error) throw error;
    return mapContract(updated as any);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) throw error;
  },

  bill: async (id: string) => {
    const { data: contract, error } = await supabase.from("contracts").select("*").eq("id", id).single();
    if (error) throw error;

    const due = new Date();
    due.setDate(due.getDate() + 7);

    const { error: receivableError } = await supabase.from("receivables").insert({
      description: `Contrato ${contract.contract_number}`,
      customer_id: contract.customer_id,
      contract_id: contract.id,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: due.toISOString().slice(0, 10),
      amount: contract.monthly_amount,
      open_amount: contract.monthly_amount,
      status: "open",
      origin_type: "contract",
      origin_id: contract.id,
    });
    if (receivableError) throw receivableError;
  },

  /**
   * Processa faturamento em lote para todos os contratos ativos que ainda não
   * foram faturados no mês de referência.
   */
  processBatchBilling: async (monthRef: string): Promise<number> => {
    const { data: activeContracts, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("status", "active");
    if (error) throw error;

    const { data: existing, error: existingError } = await supabase
      .from("receivables")
      .select("contract_id, issue_date")
      .like("issue_date", `${monthRef}%`);
    if (existingError) throw existingError;

    const billed = new Set((existing ?? []).map((r) => r.contract_id).filter(Boolean));
    let count = 0;
    for (const ct of activeContracts ?? []) {
      if (billed.has(ct.id)) continue;
      await contractService.bill(ct.id);
      count++;
    }
    return count;
  },

  listItems: async (contractId: string): Promise<ContractItem[]> => {
    const { data, error } = await supabase.from("contract_items").select("*").eq("contract_id", contractId);
    if (error) throw error;
    return (data ?? []).map(mapContractItem);
  },

  addItems: async (contractId: string, items: ContractItem[]) => {
    const payload: ContractItemInsert[] = items.map((i) => ({
      contract_id: contractId,
      catalog_item_id: i.catalogItemId ?? null,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      billing_frequency: i.billingFrequency ?? null,
      start_date: i.startDate ?? null,
      end_date: i.endDate ?? null,
      is_recurring: i.isRecurring,
    }));

    const { error } = await supabase.from("contract_items").insert(payload);
    if (error) throw error;
  },
};
