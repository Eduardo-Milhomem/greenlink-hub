import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { CatalogItem } from "@/types/catalog";

export const useCatalog = () => {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: services.catalog.list,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CatalogItem>) => services.catalog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};

export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogItem> }) =>
      services.catalog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};

export const useRemoveCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.catalog.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};
