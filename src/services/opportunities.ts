import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Opportunity, OpportunityStage } from "@/types/opportunity";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];
type OpportunityUpdate = Database["public"]["Tables"]["opportunities"]["Update"];

const mapOpportunity = (row: OpportunityRow): Opportunity => ({
  id: row.id,
  leadId: row.lead_id ?? undefined,
  customerId: row.customer_id ?? undefined,
  title: row.title,
  stage: row.stage,
  amount: Number(row.amount) || 0,
  expectedCloseDate: row.expected_close_date ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  winProbability: row.win_probability ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildOpportunityPayload = (data: Partial<Opportunity>): OpportunityInsert | OpportunityUpdate => ({
  lead_id: data.leadId ?? null,
  customer_id: data.customerId ?? null,
  title: data.title,
  stage: data.stage,
  amount: data.amount,
  expected_close_date: data.expectedCloseDate ?? null,
  assigned_to: data.assignedTo ?? null,
  win_probability: data.winProbability ?? null,
  notes: data.notes ?? null,
});

export const opportunityService = {
  list: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from("opportunities").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapOpportunity);
  },

  create: async (data: Partial<Opportunity>) => {
    const { data: created, error } = await supabase
      .from("opportunities")
      .insert({
        lead_id: data.leadId ?? null,
        customer_id: data.customerId ?? null,
        title: data.title!,
        stage: data.stage ?? "novo",
        amount: data.amount ?? 0,
        expected_close_date: data.expectedCloseDate ?? null,
        assigned_to: data.assignedTo ?? null,
        win_probability: data.winProbability ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapOpportunity(created);
  },

  update: async (id: string, data: Partial<Opportunity>) => {
    const { data: updated, error } = await supabase
      .from("opportunities")
      .update(buildOpportunityPayload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapOpportunity(updated);
  },

  move: async (id: string, stage: OpportunityStage) => {
    const { data: updated, error } = await supabase
      .from("opportunities")
      .update({ stage })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapOpportunity(updated);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) throw error;
  },
};
