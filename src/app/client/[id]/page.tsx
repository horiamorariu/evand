import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import ClientDetail from "./ClientDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientPage({ params }: Props) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/auth/login");

  const { id } = await params;
  const db = getAdminDb();

  const clientSnap = await db.collection("clients").doc(id).get();
  if (!clientSnap.exists) notFound();

  const c = clientSnap.data()!;
  const isOwner = c.agent_id === sessionUser.uid;
  const isAdmin = sessionUser.profile.role === "admin" && c.agency_id === sessionUser.profile.agency_id;
  if (!isOwner && !isAdmin) redirect("/dashboard");

  let docsSnap;
  try {
    docsSnap = await db
      .collection("documents")
      .where("client_cnp", "==", c.cnp)
      .where("agency_id", "==", c.agency_id)
      .orderBy("created_at", "desc")
      .limit(20)
      .get();
  } catch {
    docsSnap = await db
      .collection("documents")
      .where("client_cnp", "==", c.cnp)
      .where("agency_id", "==", c.agency_id)
      .limit(20)
      .get();
  }

  const documents = docsSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      type: d.type ?? "",
      status: d.status ?? "generat",
      created_at: d.created_at?.toDate?.().toISOString() ?? "",
    };
  });

  return (
    <ClientDetail
      clientId={id}
      firstName={c.first_name ?? ""}
      lastName={c.last_name ?? ""}
      cnp={c.cnp ?? ""}
      address={c.address ?? ""}
      createdAt={c.created_at?.toDate?.().toISOString() ?? ""}
      docCount={c.doc_count ?? 0}
      notes={c.notes ?? ""}
      documents={documents}
    />
  );
}
