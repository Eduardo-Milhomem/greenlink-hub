import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Asset } from "@/types/asset";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];

const mapAsset = (row: AssetRow): Asset => ({
  id: row.id,
  assetTag: row.asset_tag,
  assetModelId: undefined,
  catalogItemId: row.catalog_item_id ?? undefined,
  serialNumber: row.serial_number ?? undefined,
  ownerType: row.owner_type,
  customerId: row.customer_id ?? undefined,
  contractId: row.contract_id ?? undefined,
  status: row.status,
  siteName: row.site_name ?? undefined,
  addressId: row.address_id ?? undefined,
  installedAt: row.installed_at ?? undefined,
  lastReadingAt: row.last_reading_at ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildAssetPayload = (data: Partial<Asset>): AssetInsert | AssetUpdate => ({
  asset_tag: data.assetTag,
  catalog_item_id: data.catalogItemId ?? null,
  serial_number: data.serialNumber ?? null,
  owner_type: data.ownerType,
  customer_id: data.customerId ?? null,
  contract_id: data.contractId ?? null,
  status: data.status,
  site_name: data.siteName ?? null,
  address_id: data.addressId ?? null,
  installed_at: data.installedAt ?? null,
  last_reading_at: data.lastReadingAt ?? null,
  notes: data.notes ?? null,
});

export const assetService = {
  list: async (): Promise<Asset[]> => {
    const { data, error } = await supabase.from("assets").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAsset);
  },

  get: async (id: string): Promise<Asset | undefined> => {
    const { data, error } = await supabase.from("assets").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapAsset(data) : undefined;
  },

  create: async (data: Partial<Asset>) => {
    const { data: created, error } = await supabase
      .from("assets")
      .insert({
        asset_tag: data.assetTag!,
        catalog_item_id: data.catalogItemId ?? null,
        serial_number: data.serialNumber ?? null,
        owner_type: data.ownerType ?? "greenlink",
        customer_id: data.customerId ?? null,
        contract_id: data.contractId ?? null,
        status: data.status ?? "available",
        site_name: data.siteName ?? null,
        address_id: data.addressId ?? null,
        installed_at: data.installedAt ?? null,
        last_reading_at: data.lastReadingAt ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapAsset(created);
  },

  update: async (id: string, data: Partial<Asset>) => {
    const { data: updated, error } = await supabase
      .from("assets")
      .update(buildAssetPayload(data))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapAsset(updated);
  },

  remove: async (id: string) => {
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) throw error;
  },
};
