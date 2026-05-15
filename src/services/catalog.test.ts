import { describe, it, expect, vi, type Mock } from "vitest";
import { catalogService } from "./catalog";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

describe("catalogService", () => {
  it("deve retornar lista vazia se não houver dados", async () => {
    const items = await catalogService.list();
    expect(items).toEqual([]);
  });

  it("deve lançar erro se o supabase retornar erro", async () => {
    (supabase.from as Mock).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: null, error: { message: "Table not found" } })),
      })),
    }));

    await expect(catalogService.list()).rejects.toThrow("Table not found");
  });

  it("deve mapear corretamente os dados do banco para o modelo da aplicação", async () => {
    const mockRow = {
      id: "1",
      item_code: "TEST",
      name: "Test Item",
      item_type: "product",
      unit_code: "un",
      sale_price: 100,
      cost_price: 50,
      is_active: true,
      track_stock: false,
      track_serial: false,
      is_recurring: false,
      description: "Desc",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    (supabase.from as Mock).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [mockRow], error: null })),
      })),
    }));

    const items = await catalogService.list();
    expect(items[0]).toMatchObject({
      id: "1",
      itemCode: "TEST",
      name: "Test Item",
      itemType: "product",
      salePrice: 100,
    });
  });
});
