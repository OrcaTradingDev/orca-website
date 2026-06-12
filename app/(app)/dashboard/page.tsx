import { redirect } from "next/navigation";

// Legacy route — permanently moved to /screener
export default function DashboardRedirect() {
  redirect("/screener");
}
