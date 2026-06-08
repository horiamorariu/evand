import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const { notes } = await request.json();

  const db = getAdminDb();
  const snap = await db.collection("clients").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Client negasit" }, { status: 404 });

  const data = snap.data()!;
  const isOwner = data.agent_id === sessionUser.uid;
  const isAdmin = sessionUser.profile.role === "admin" && data.agency_id === sessionUser.profile.agency_id;
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  await db.collection("clients").doc(id).update({ notes: String(notes).slice(0, 2000) });
  return NextResponse.json({ ok: true });
}
