import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";

export const useReceivables = () => {
  return useQuery({
    queryKey: ["receivables"],
    queryFn: services.finance.listReceivables,
  });
};

export const usePayables = () => {
  return useQuery({
    queryKey: ["payables"],
    queryFn: services.finance.listPayables,
  });
};

export const useReceivePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      services.finance.receive(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
    },
  });
};

export const useCreateReceivable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.finance.createReceivable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
    },
  });
};

export const useCreatePayable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.finance.createPayable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
  });
};
