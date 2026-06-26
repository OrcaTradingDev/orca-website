// Matches Pydantic "SubscriptionStatus"
export interface SubscriptionStatus {
  has_subscription: boolean;
  cancel_at_period_end: boolean;
  current_period_end: string | null; // ISO timestamp
}
