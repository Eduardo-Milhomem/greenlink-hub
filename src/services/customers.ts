import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Customer, CustomerContact } from "@/types/customer";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];
type CustomerContactRow = Database["public"]["Tables"]["customer_contacts"]["Row"];
type CustomerAddressRow = Database["public"]["Tables"]["customer_addresses"]["Row"];

type CustomerWithRelations = CustomerRow & {
  customer_contacts?: CustomerContactRow[] | null;
  customer_addresses?: CustomerAddressRow[] | null;
};

const mapContact = (row: CustomerContactRow): CustomerContact => ({
  id: row.id,
  fullName: row.full_name,
  roleTitle: row.role_title ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  isPrimary: !!row.is_primary,
});

const mapCustomer = (row: CustomerWithRelations): Customer => ({
  id: row.id,
  customerType: row.customer_type,
  legalName: row.legal_name,
  tradeName: row.trade_name ?? undefined,
  documentNumber: row.document_number ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  city: row.city ?? undefined,
  state: row.state ?? undefined,
  status: row.status,
  notes: row.notes ?? undefined,
  contacts: (row.customer_contacts ?? []).map(mapContact),
  addresses: (row.customer_addresses ?? []).map((a) => ({
    id: a.id,
    label: a.label ?? undefined,
    street: a.street ?? undefined,
    number: a.number ?? undefined,
    complement: a.complement ?? undefined,
    district: a.district ?? undefined,
    city: a.city ?? undefined,
    state: a.state ?? undefined,
    zipCode: a.zip_code ?? undefined,
    latitude: a.latitude ?? undefined,
    longitude: a.longitude ?? undefined,
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildCustomerPayload = (data: Partial<Customer>): CustomerInsert | CustomerUpdate => ({
  customer_type: data.customerType,
  legal_name: data.legalName,
  trade_name: data.tradeName ?? null,
  document_number: data.documentNumber ?? null,
  email: data.email ?? null,
  phone: data.phone ?? null,
  city: data.city ?? null,
  state: data.state ?? null,
  status: data.status,
  notes: data.notes ?? null,
});

export const customerService = {
  list: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from("customers")
      .select("*, customer_contacts!fk_cc_customer(*), customer_addresses!fk_ca_customer(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapCustomer(row as unknown as CustomerWithRelations));
  },

  get: async (id: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
      .from("customers")
      .select("*, customer_contacts!fk_cc_customer(*), customer_addresses!fk_ca_customer(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCustomer(data as unknown as CustomerWithRelations) : undefined;
  },

  create: async (data: Partial<Customer>) => {
    const { data: created, error } = await supabase
      .from("customers")
      .insert({
        customer_type: data.customerType ?? "pj",
        legal_name: data.legalName!,
        trade_name: data.tradeName ?? null,
        document_number: data.documentNumber ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        status: data.status ?? "active",
        notes: data.notes ?? null,
      })
      .select("*, customer_contacts!fk_cc_customer(*), customer_addresses!fk_ca_customer(*)")
      .single();
    if (error) throw error;
    return mapCustomer(created as unknown as CustomerWithRelations);
  },

  update: async (id: string, data: Partial<Customer>) => {
    const { data: updated, error } = await supabase
      .from("customers")
      .update(buildCustomerPayload(data))
      .eq("id", id)
      .select("*, customer_contacts!fk_cc_customer(*), customer_addresses!fk_ca_customer(*)")
      .single();
    if (error) throw error;
    return mapCustomer(updated as unknown as CustomerWithRelations);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
  },
};
