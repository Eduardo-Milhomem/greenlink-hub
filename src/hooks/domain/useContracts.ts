import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import type { ContractItem } from "@/types/contract";

export const useContracts = () => {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: services.contracts.list,
  });
};

export const useContract = (id?: string) => {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => services.contracts.get(id!),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.contracts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export const useBillContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.contracts.bill,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", id] });
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
    },
  });
};

export const useContractItems = (contractId?: string) => {
  return useQuery({
    queryKey: ["contracts", contractId, "items"],
    queryFn: () => services.contracts.listItems(contractId!),
    enabled: !!contractId,
  });
};

export const useAddContractItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, items }: { contractId: string; items: ContractItem[] }) =>
      services.contracts.addItems(contractId, items),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "items"] });
    },
  });
};

export const useRemoveContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.contracts.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};
