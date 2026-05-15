import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Quote, QuoteItem, QuoteStatus } from "@/types/quote";

type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
type QuoteUpdate = Database["public"]["Tables"]["quotes"]["Update"];
type QuoteItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type QuoteItemInsert = Database["public"]["Tables"]["quote_items"]["Insert"];

type QuoteWithRelations = QuoteRow & { quote_items?: QuoteItemRow[] | null };

const mapQuoteItem = (row: QuoteItemRow): QuoteItem => ({
  id: row.id,
  quoteId: row.quote_id,
  catalogItemId: row.catalog_item_id ?? undefined,
  itemDescription: row.item_description,
  itemType: row.item_type,
  quantity: Number(row.quantity) || 0,
  unitPrice: Number(row.unit_price) || 0,
  discountAmount: Number(row.discount_amount) || 0,
  totalAmount: Number(row.total_amount) || 0,
  sortOrder: row.sort_order,
});

const mapQuote = (row: QuoteWithRelations): Quote => ({
  id: row.id,
  quoteNumber: row.quote_number,
  customerId: row.customer_id,
  opportunityId: row.opportunity_id ?? undefined,
  status: row.status,
  issueDate: row.issue_date,
  validUntil: row.valid_until ?? undefined,
  subtotal: Number(row.subtotal) || 0,
  discountAmount: Number(row.discount_amount) || 0,
  totalAmount: Number(row.total_amount) || 0,
  notes: row.notes ?? undefined,
  approvedAt: row.approved_at ?? undefined,
  approvedBy: row.approved_by ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  items: (row.quote_items ?? []).map(mapQuoteItem),
});

const buildQuotePayload = (data: Partial<Quote>): QuoteInsert | QuoteUpdate => ({
  quote_number: data.quoteNumber,
  customer_id: data.customerId,
  opportunity_id: data.opportunityId ?? null,
  status: data.status,
  issue_date: data.issueDate,
  valid_until: data.validUntil ?? null,
  subtotal: data.subtotal,
  discount_amount: data.discountAmount,
  total_amount: data.totalAmount,
  notes: data.notes ?? null,
  approved_at: data.approvedAt ?? null,
  approved_by: data.approvedBy ?? null,
});

const calcTotalsFromItems = (items: QuoteItem[]) => {
  const subtotal = items.reduce((acc, i) => acc + Number(i.unitPrice) * Number(i.quantity), 0);
  const discountAmount = items.reduce((acc, i) => acc + Number(i.discountAmount), 0);
  const totalAmount = items.reduce((acc, i) => acc + Number(i.totalAmount), 0);
  return { subtotal, discountAmount, totalAmount };
};

export const quoteService = {
  list: async (): Promise<Quote[]> => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*, quote_items!fk_qi_quote(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapQuote(row as unknown as QuoteWithRelations));
  },

  get: async (id: string): Promise<Quote | undefined> => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*, quote_items!fk_qi_quote(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapQuote(data as unknown as QuoteWithRelations) : undefined;
  },

  create: async (data: Partial<Quote>) => {
    const now = new Date();
    const quoteNumber =
      data.quoteNumber ??
      `QT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    const items: QuoteItem[] = data.items ?? [];
    const totals = calcTotalsFromItems(items);

    const { data: created, error } = await supabase
      .from("quotes")
      .insert({
        quote_number: quoteNumber,
        customer_id: data.customerId!,
        opportunity_id: data.opportunityId ?? null,
        status: data.status ?? "draft",
        issue_date: data.issueDate ?? now.toISOString().slice(0, 10),
        valid_until: data.validUntil ?? null,
        subtotal: data.subtotal ?? totals.subtotal,
        discount_amount: data.discountAmount ?? totals.discountAmount,
        total_amount: data.totalAmount ?? totals.totalAmount,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    if (items.length) {
      const payload: QuoteItemInsert[] = items.map((i) => ({
        quote_id: created.id,
        catalog_item_id: i.catalogItemId ?? null,
        item_description: i.itemDescription,
        item_type: i.itemType,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        discount_amount: i.discountAmount,
        total_amount: i.totalAmount,
        sort_order: i.sortOrder,
      }));
      const { error: itemError } = await supabase.from("quote_items").insert(payload);
      if (itemError) throw itemError;
    }

    const full = await quoteService.get(created.id);
    return full!;
  },

  update: async (id: string, data: Partial<Quote>) => {
    const { data: updated, error } = await supabase
      .from("quotes")
      .update(buildQuotePayload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapQuote(updated as unknown as QuoteWithRelations);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;
  },

  send: async (id: string) => {
    const { error } = await supabase.from("quotes").update({ status: "sent" }).eq("id", id);
    if (error) throw error;
  },

  approve: async (id: string) => {
    const { error } = await supabase
      .from("quotes")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  reject: async (id: string) => {
    const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("id", id);
    if (error) throw error;
  },

  generateOrder: async (id: string) => {
    const quote = await quoteService.get(id);
    if (!quote) throw new Error("Orçamento não encontrado");

    const now = new Date();
    const orderNumber = `PD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

    const { data: order, error } = await supabase
      .from("customer_orders")
      .insert({
        order_number: orderNumber,
        quote_id: quote.id,
        customer_id: quote.customerId,
        status: "open",
        order_date: now.toISOString().slice(0, 10),
        subtotal: quote.subtotal,
        discount_amount: quote.discountAmount,
        total_amount: quote.totalAmount,
        notes: quote.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    if (quote.items.length) {
      const payload = quote.items.map((i) => ({
        order_id: order.id,
        catalog_item_id: i.catalogItemId ?? null,
        description: i.itemDescription,
        item_type: i.itemType,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        total_amount: i.totalAmount,
      }));
      const { error: itemError } = await supabase.from("order_items").insert(payload);
      if (itemError) throw itemError;
    }
    return order;
  },
};
