import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { CustomerOrder, CustomerOrderItem, OrderStatus } from "@/types/order";

type OrderRow = Database["public"]["Tables"]["customer_orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

type OrderWithRelations = OrderRow & { order_items?: OrderItemRow[] | null };

const mapOrderItem = (row: OrderItemRow): CustomerOrderItem => ({
  id: row.id,
  orderId: row.order_id,
  catalogItemId: row.catalog_item_id ?? undefined,
  description: row.description,
  itemType: row.item_type,
  quantity: Number(row.quantity) || 0,
  unitPrice: Number(row.unit_price) || 0,
  totalAmount: Number(row.total_amount) || 0,
  serviceStartDate: row.service_start_date ?? undefined,
  serviceEndDate: row.service_end_date ?? undefined,
});

const mapOrder = (row: OrderWithRelations): CustomerOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  quoteId: row.quote_id ?? undefined,
  customerId: row.customer_id,
  status: row.status,
  orderDate: row.order_date,
  subtotal: Number(row.subtotal) || 0,
  discountAmount: Number(row.discount_amount) || 0,
  totalAmount: Number(row.total_amount) || 0,
  notes: row.notes ?? undefined,
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  items: (row.order_items ?? []).map(mapOrderItem),
});

export const orderService = {
  list: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*, order_items!fk_oi_order(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapOrder(row as unknown as OrderWithRelations));
  },

  get: async (id: string): Promise<Order | undefined> => {
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*, order_items!fk_oi_order(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOrder(data as unknown as OrderWithRelations) : undefined;
  },

  setStatus: async (id: string, status: string) => {
    const next: OrderStatus =
      status === "open" ||
      status === "approved" ||
      status === "invoiced" ||
      status === "partially_fulfilled" ||
      status === "fulfilled" ||
      status === "cancelled"
        ? (status as OrderStatus)
        : "open";

    const { error } = await supabase.from("customer_orders").update({ status: next }).eq("id", id);
    if (error) throw error;
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("customer_orders").delete().eq("id", id);
    if (error) throw error;
  },
};
