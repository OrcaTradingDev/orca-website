import "@/features/dashboard/styles/dashboard-tw.css";
import SubscriptionSection from "@/features/dashboard/components/SubscriptionSection";

export const metadata = { title: "Billing — OrcaTrading" };

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-[64px]">
      <main className="p-6 sm:p-10 md:p-14 max-w-[860px] mx-auto">
        <SubscriptionSection />
      </main>
    </div>
  );
}
