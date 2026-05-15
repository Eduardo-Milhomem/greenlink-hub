import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { Asset } from "@/types/asset";

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: services.assets.list,
  });
};

export const useAsset = (id?: string) => {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => services.assets.get(id!),
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.assets.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) => services.assets.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets", id] });
    },
  });
};

export const useRemoveAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.assets.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });
};
