import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import HistoryClient from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login");

  const { uid } = sessionUser;

  let snap;
  try {
    snap = await getAdminDb()
      .collection("clients")
      .where("agent_id", "==", uid)
      .orderBy("created_at", "desc")
      .limit(500)
      .get();
  } catch {
    snap = await getAdminDb()
      .collection("clients")
      .where("agent_id", "==", uid)
      .limit(500)
      .get();
  }

  const clients = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      first_name: d.first_name ?? "",
      last_name: d.last_name ?? "",
      cnp: d.cnp ?? "",
      address: d.address ?? "",
      property_address: d.property_address ?? "",
      created_at: d.created_at?.toDate?.().toISOString() ?? "",
      doc_count: d.doc_count ?? 0,
      notes: d.notes ?? "",
    };
  });

  return <HistoryClient clients={clients} />;
}
