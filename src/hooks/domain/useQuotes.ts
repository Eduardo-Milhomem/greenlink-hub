import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "@/services";
import { Quote } from "@/types/quote";

export const useQuotes = () => {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: services.quotes.list,
  });
};

export const useQuote = (id?: string) => {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => services.quotes.get(id!),
    enabled: !!id,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.quotes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      services.quotes.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quotes", id] });
    },
  });
};

export const useApproveQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.quotes.approve,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quotes", id] });
    },
  });
};

export const useRemoveQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.quotes.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useGenerateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: services.quotes.generateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
