import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelSubscription, fetchSubscriptionStatus } from "@/features/dashboard/services/subscription";
import { queryKeys } from "@/lib/query/keys";
import { SubscriptionStatus } from "@/features/dashboard/types/subscription";

export const useSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus, Error>({
    queryKey: queryKeys.subscription.status(),
    queryFn: fetchSubscriptionStatus,
    retry: 1,
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.subscription.status(), data);
    },
  });
};
