import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { StockMovement } from "@/types/inventory";

export const useInventoryMovements = () => {
  return useQuery({
    queryKey: ["inventory", "movements"],
    queryFn: services.inventory.listMovements,
  });
};

export const useAddStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StockMovement>) => services.inventory.addMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] });
    },
  });
};

export const useUpdateMinimumStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      catalogItemId,
      minimumStock,
    }: {
      catalogItemId: string;
      minimumStock: number;
    }) => services.inventory.upsertMinimumStock(catalogItemId, minimumStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] });
    },
  });
};
