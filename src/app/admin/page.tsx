import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login");
  if (sessionUser.profile.role !== "admin") redirect("/dashboard");

  return (
    <AdminDashboard
      agencyName={sessionUser.agency.name}
      agentName={sessionUser.profile.full_name}
    />
  );
}
