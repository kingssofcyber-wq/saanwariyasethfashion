import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/account");
  return <AdminDashboard adminName={session.name} />;
}
