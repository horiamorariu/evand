import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  if (sessionUser.profile.role !== "admin") return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const db = getAdminDb();
  let query = db.collection("documents")
    .where("agency_id", "==", sessionUser.profile.agency_id)
    .orderBy("created_at", "desc");

  if (from) query = query.where("created_at", ">=", Timestamp.fromDate(new Date(from))) as typeof query;
  if (to) query = query.where("created_at", "<=", Timestamp.fromDate(new Date(to))) as typeof query;

  const snap = await query.limit(200).get();
  const docs = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      client_id: data.client_id,
      agency_id: data.agency_id,
      agent_id: data.agent_id,
      agent_name: data.agent_name ?? "",
      client_name: data.client_name ?? "",
      client_cnp: data.client_cnp ?? "",
      type: data.type,
      status: data.status ?? "generat",
      signed_file_path: data.signed_file_path ?? null,
      created_at: data.created_at?.toDate?.().toISOString() ?? "",
    };
  });

  return NextResponse.json({ documents: docs });
}
