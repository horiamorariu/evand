import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Fisier lipsa" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Fisier prea mare (max 10MB)" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const db = getAdminDb();
  const docSnap = await db.collection("documents").doc(id).get();
  if (!docSnap.exists) return NextResponse.json({ error: "Document negasit" }, { status: 404 });

  // Verificare acces: admin sau agentul care a creat
  const docData = docSnap.data()!;
  const isAdmin = sessionUser.profile.role === "admin";
  const isOwner = docData.agent_id === sessionUser.uid;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  await db.collection("documents").doc(id).update({
    signed_file_data: dataUrl,
    signed_file_name: file.name,
    status: "semnat_olograf",
  });

  return NextResponse.json({ ok: true, dataUrl });
}
