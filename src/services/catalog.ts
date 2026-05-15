import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { CatalogItem } from "@/types/catalog";

type CatalogRow = Database["public"]["Tables"]["catalog_items"]["Row"];
type CatalogInsert = Database["public"]["Tables"]["catalog_items"]["Insert"];
type CatalogUpdate = Database["public"]["Tables"]["catalog_items"]["Update"];

const mapCatalogItem = (row: CatalogRow): CatalogItem => {
  try {
    return {
      id: row.id,
      itemCode: row.item_code,
      name: row.name,
      itemType: row.item_type as CatalogItemType,
      unitCode: row.unit_code,
      salePrice: Number(row.sale_price) || 0,
      costPrice: Number(row.cost_price) || 0,
      isActive: !!row.is_active,
      trackStock: !!row.track_stock,
      trackSerial: !!row.track_serial,
      isRecurring: !!row.is_recurring,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (e) {
    console.error("[CatalogService] Error mapping row:", e, row);
    throw new Error("Erro ao processar dados do catálogo");
  }
};

const buildCatalogPayload = (data: Partial<CatalogItem>): CatalogInsert | CatalogUpdate => ({
  item_code: data.itemCode,
  name: data.name,
  item_type: data.itemType,
  unit_code: data.unitCode,
  sale_price: data.salePrice,
  cost_price: data.costPrice,
  is_active: data.isActive,
  track_stock: data.trackStock,
  track_serial: data.trackSerial,
  is_recurring: data.isRecurring,
  description: data.description ?? null,
});

export const catalogService = {
  list: async (): Promise<CatalogItem[]> => {
    try {
      console.log("[CatalogService] Listing items...");
      const { data, error } = await supabase.from("catalog_items").select("*").order("name");

      if (error) {
        console.error("[CatalogService] Supabase error listing items:", error);
        // Se a tabela não existir, retornamos vazio em vez de quebrar tudo,
        // mas lançamos para o loader tratar se necessário.
        throw error;
      }

      return (data ?? []).map(mapCatalogItem);
    } catch (e) {
      console.error("[CatalogService] Unexpected error in list():", e);
      throw e;
    }
  },

  create: async (data: Partial<CatalogItem>) => {
    console.log("[CatalogService] Creating item:", data);
    const { data: created, error } = await supabase
      .from("catalog_items")
      .insert({
        item_code: data.itemCode!,
        name: data.name!,
        item_type: data.itemType ?? "product",
        unit_code: data.unitCode ?? "un",
        sale_price: data.salePrice ?? 0,
        cost_price: data.costPrice ?? 0,
        is_active: data.isActive ?? true,
        track_stock: data.trackStock ?? false,
        track_serial: data.trackSerial ?? false,
        is_recurring: data.isRecurring ?? false,
        description: data.description ?? null,
      })
      .select()
      .single();
    if (error) {
      console.error("[CatalogService] Error creating item:", error);
      throw error;
    }
    return mapCatalogItem(created);
  },

  update: async (id: string, data: Partial<CatalogItem>) => {
    const { data: updated, error } = await supabase
      .from("catalog_items")
      .update(buildCatalogPayload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapCatalogItem(updated);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) throw error;
  },
};
