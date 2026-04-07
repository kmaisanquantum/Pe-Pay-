import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorDashboard from "./VendorDashboard";
import type { Transaction } from "@/types";

export const metadata = { title: "Dashboard — DSP Vendor Hub" };

export default async function VendorPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch vendor profile
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!vendor) redirect("/onboarding");

  // Fetch last 30 transactions for ledger + stats
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, receipt_date, vendor_name, total_kina, items, ocr_confidence, source, created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(30);

  // Compute monthly stats (current calendar month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthly = (transactions || []).filter((t) => t.created_at >= monthStart);
  const monthlyTotal = monthly.reduce((s, t) => s + (t.total_kina || 0), 0);

  return (
    <VendorDashboard
      vendor={vendor}
      transactions={(transactions || []) as Transaction[]}
      monthlyTotal={monthlyTotal}
      transactionCount={monthly.length}
    />
  );
}
