import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import type { DocumentStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: DocumentStatus[] = ["generat", "printat", "semnat_olograf", "complet"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  if (sessionUser.profile.role !== "admin") return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status invalid" }, { status: 400 });
  }

  await getAdminDb().collection("documents").doc(id).update({ status });
  return NextResponse.json({ ok: true });
}
