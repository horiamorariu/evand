import { NextRequest, NextResponse } from "next/server";
import { extractBuletinData } from "@/lib/ocr/gemini-vision";
import { getSessionUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: "Imagine lipsă" }, { status: 400 });
  }

  if (imageFile.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Imaginea este prea mare (max 10MB)" }, { status: 400 });
  }

  const buffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = (imageFile.type || "image/jpeg") as string;

  try {
    const data = await extractBuletinData(base64, mimeType);
    return NextResponse.json(data);
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "Extragerea datelor a eșuat" }, { status: 500 });
  }
}
