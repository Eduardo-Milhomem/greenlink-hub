import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Lead } from "@/types/lead";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

const mapLead = (row: LeadRow): Lead => ({
  id: row.id,
  name: row.name,
  companyName: row.company_name ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  source: row.source ?? undefined,
  status: row.status,
  assignedTo: row.assigned_to ?? undefined,
  convertedCustomerId: row.converted_customer_id ?? undefined,
  convertedAt: row.converted_at ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildLeadPayload = (data: Partial<Lead>): LeadInsert | LeadUpdate => ({
  name: data.name,
  company_name: data.companyName ?? null,
  email: data.email ?? null,
  phone: data.phone ?? null,
  source: data.source ?? null,
  status: data.status,
  assigned_to: data.assignedTo ?? null,
  converted_customer_id: data.convertedCustomerId ?? null,
  converted_at: data.convertedAt ?? null,
  notes: data.notes ?? null,
});

export const leadService = {
  list: async (): Promise<Lead[]> => {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLead);
  },

  create: async (data: Partial<Lead>) => {
    const { data: created, error } = await supabase
      .from("leads")
      .insert({
        name: data.name!,
        company_name: data.companyName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        source: data.source ?? null,
        status: data.status ?? "novo",
        assigned_to: data.assignedTo ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapLead(created);
  },

  update: async (id: string, data: Partial<Lead>) => {
    const { data: updated, error } = await supabase
      .from("leads")
      .update(buildLeadPayload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapLead(updated);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },

  convert: async (id: string, customerId?: string) => {
    const { data: updated, error } = await supabase
      .from("leads")
      .update({
        status: "convertido",
        converted_at: new Date().toISOString(),
        converted_customer_id: customerId ?? null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapLead(updated);
  },
};
