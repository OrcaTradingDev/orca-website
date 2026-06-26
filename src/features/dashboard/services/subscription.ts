import { http } from "@/lib/http";
import { SubscriptionStatus } from "@/features/dashboard/types/subscription";

/**
 * Fetches the current user's subscription state (active/cancel-pending/period end).
 */
export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await http.get<SubscriptionStatus>("/stripe/subscription-status");
  return response.data;
};

/**
 * Cancels the current user's subscription at the end of the current billing
 * period — access continues until then, billing just stops renewing.
 */
export const cancelSubscription = async (): Promise<SubscriptionStatus> => {
  const response = await http.post<SubscriptionStatus>("/stripe/cancel-subscription");
  return response.data;
};
