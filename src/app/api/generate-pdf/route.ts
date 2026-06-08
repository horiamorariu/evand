import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateMandat, generateGdpr } from "@/lib/pdf/generate";
import { Timestamp } from "firebase-admin/firestore";
import type { BuletinData, DocumentType, MandatExtraFields } from "@/types";

export const dynamic = "force-dynamic";

interface RequestBody {
  buletinData: BuletinData;
  selectedDocs: DocumentType[];
  extraFields: Partial<MandatExtraFields>;
  signatureBase64?: string;
}

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { uid, profile, agency } = sessionUser;
  const body: RequestBody = await request.json();
  const { buletinData, selectedDocs, extraFields, signatureBase64 } = body;

  const db = getAdminDb();

  // Salvează clientul în Firestore
  const clientRef = db.collection("clients").doc();
  await clientRef.set({
    agent_id: uid,
    agency_id: profile.agency_id,
    last_name: buletinData.last_name,
    first_name: buletinData.first_name,
    cnp: buletinData.cnp,
    buletin_series: buletinData.series,
    buletin_number: buletinData.number,
    address: buletinData.address,
    birthdate: buletinData.birthdate,
    buletin_expiry: buletinData.expiry_date,
    doc_count: 0,
    created_at: Timestamp.now(),
  });

  const generatedDocs: { type: DocumentType; dataUrl: string; filename: string }[] = [];
  const opts = { buletinData, agent: profile, agency, signatureBase64 };

  for (const docType of selectedDocs) {
    let pdfBytes: Uint8Array;

    if (docType === "mandat") {
      if (!extraFields.property_address) {
        return NextResponse.json({ error: "Campuri mandat incomplete" }, { status: 400 });
      }
      pdfBytes = await generateMandat({ ...opts, extra: extraFields as MandatExtraFields });
    } else {
      pdfBytes = await generateGdpr(opts);
    }

    const base64 = Buffer.from(pdfBytes).toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;
    const filename = `${docType}-${buletinData.last_name}-${buletinData.first_name}.pdf`.toLowerCase().replace(/\s+/g, "-");

    await db.collection("documents").doc().set({
      client_id: clientRef.id,
      agency_id: profile.agency_id,
      agent_id: uid,
      agent_name: profile.full_name,
      client_name: `${buletinData.last_name} ${buletinData.first_name}`,
      client_cnp: buletinData.cnp,
      type: docType,
      status: "generat",
      created_at: Timestamp.now(),
    });

    generatedDocs.push({ type: docType, dataUrl, filename });
  }

  await clientRef.update({ doc_count: selectedDocs.length });

  await db.collection("audit_logs").add({
    agent_id: uid,
    action: "generate_documents",
    resource_type: "client",
    resource_id: clientRef.id,
    metadata: { doc_types: selectedDocs },
    created_at: Timestamp.now(),
  });

  return NextResponse.json({ clientId: clientRef.id, documents: generatedDocs });
}
