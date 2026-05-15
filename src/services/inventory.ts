import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { StockBalance, StockMovement, StockMovementType } from "@/types/inventory";

type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];
type StockMovementInsert = Database["public"]["Tables"]["stock_movements"]["Insert"];
type StockBalanceRow = Database["public"]["Tables"]["stock_balances"]["Row"];
type StockBalanceInsert = Database["public"]["Tables"]["stock_balances"]["Insert"];

const DEFAULT_WAREHOUSE = "main";

const mapMovement = (row: StockMovementRow): StockMovement => ({
  id: row.id,
  movementType: row.movement_type as StockMovementType,
  catalogItemId: row.catalog_item_id,
  sourceWarehouseId: row.source_warehouse_id ?? undefined,
  targetWarehouseId: row.target_warehouse_id ?? undefined,
  quantity: Number(row.quantity) || 0,
  referenceType: row.reference_type ?? undefined,
  referenceId: row.reference_id ?? undefined,
  occurredAt: row.occurred_at,
  notes: row.notes ?? undefined,
  createdBy: row.created_by ?? undefined,
});

const mapBalance = (row: StockBalanceRow): StockBalance => ({
  warehouseId: row.warehouse_id,
  catalogItemId: row.catalog_item_id,
  onHand: Number(row.on_hand) || 0,
  reserved: Number(row.reserved) || 0,
  minimumStock: Number(row.minimum_stock) || 0,
});

export const inventoryService = {
  listMovements: async (): Promise<StockMovement[]> => {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .order("occurred_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapMovement);
  },

  addMovement: async (data: Partial<StockMovement>) => {
    const payload: StockMovementInsert = {
      movement_type: (data.movementType ?? "adjustment") as
        | "in"
        | "out"
        | "transfer"
        | "adjustment",
      catalog_item_id: data.catalogItemId!,
      source_warehouse_id: data.sourceWarehouseId ?? null,
      target_warehouse_id: data.targetWarehouseId ?? null,
      quantity: data.quantity!,
      reference_type: data.referenceType ?? null,
      reference_id: data.referenceId ?? null,
      occurred_at: data.occurredAt ?? new Date().toISOString(),
      notes: data.notes ?? null,
      created_by: data.createdBy ?? null,
    };

    const { data: created, error } = await supabase
      .from("stock_movements")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    const warehouseId = data.targetWarehouseId || data.sourceWarehouseId || DEFAULT_WAREHOUSE;
    await inventoryService.applyMovementToBalance({
      warehouseId,
      catalogItemId: created.catalog_item_id,
      movementType: created.movement_type as StockMovementType,
      quantity: Number(created.quantity) || 0,
    });

    return mapMovement(created);
  },

  listBalances: async (): Promise<StockBalance[]> => {
    const { data, error } = await supabase
      .from("stock_balances")
      .select("*")
      .order("catalog_item_id");
    if (error) throw error;
    return (data ?? []).map(mapBalance);
  },

  upsertMinimumStock: async (catalogItemId: string, minimumStock: number) => {
    const payload: StockBalanceInsert = {
      warehouse_id: DEFAULT_WAREHOUSE,
      catalog_item_id: catalogItemId,
      minimum_stock: minimumStock,
      on_hand: 0,
      reserved: 0,
    };

    const { data, error } = await supabase
      .from("stock_balances")
      .upsert(payload, { onConflict: "warehouse_id,catalog_item_id" })
      .select()
      .single();
    if (error) throw error;
    return mapBalance(data);
  },

  applyMovementToBalance: async ({
    warehouseId,
    catalogItemId,
    movementType,
    quantity,
  }: {
    warehouseId: string;
    catalogItemId: string;
    movementType: StockMovementType;
    quantity: number;
  }) => {
    const { data: current, error: loadError } = await supabase
      .from("stock_balances")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .eq("catalog_item_id", catalogItemId)
      .maybeSingle();
    if (loadError) throw loadError;

    const base = current
      ? mapBalance(current)
      : { warehouseId, catalogItemId, onHand: 0, reserved: 0, minimumStock: 0 };

    let onHand = base.onHand;
    let reserved = base.reserved;

    if (movementType === "in" || movementType === "production_in") onHand += quantity;
    else if (movementType === "out" || movementType === "consumption") onHand -= quantity;
    else if (movementType === "adjustment") onHand += quantity;
    else if (movementType === "reservation") reserved += quantity;
    else if (movementType === "release") reserved -= quantity;

    const payload: StockBalanceInsert = {
      warehouse_id: warehouseId,
      catalog_item_id: catalogItemId,
      on_hand: onHand,
      reserved,
      minimum_stock: base.minimumStock,
    };

    const { error } = await supabase
      .from("stock_balances")
      .upsert(payload, { onConflict: "warehouse_id,catalog_item_id" });
    if (error) throw error;
  },
};
