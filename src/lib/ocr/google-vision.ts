import { BuletinData } from "@/types";

interface VisionResponse {
  responses: Array<{
    textAnnotations?: Array<{ description: string }>;
    fullTextAnnotation?: { text: string };
  }>;
}

export async function extractBuletinData(imageBase64: string): Promise<BuletinData> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_CLOUD_VISION_API_KEY lipsă");

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  if (!res.ok) throw new Error("Google Vision API error");

  const json: VisionResponse = await res.json();
  const fullText = json.responses[0]?.fullTextAnnotation?.text ?? "";

  return parseBuletinText(fullText);
}

function parseBuletinText(text: string): BuletinData {
  // Regex patterns pentru buletin românesc
  const cnpMatch = text.match(/\b([1-9]\d{12})\b/);
  const seriesMatch = text.match(/\b([A-Z]{2})\s*(\d{6})\b/);

  // Extrage nume — de obicei pe linia după "Nume" sau "ROMÂNĂ"
  const numeMatch = text.match(/(?:Nume|PRENUME)\s*\n?\s*([A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚ\s-]+)/i);
  const prenumeMatch = text.match(/(?:Prenume|PRENUME)\s*\n?\s*([A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚ\s-]+)/i);

  // Data nașterii — format: DD.MM.YYYY sau DD/MM/YYYY
  const dateMatch = text.match(/\b(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})\b/g);
  const birthdate = dateMatch?.[0]?.replace(/[\/\-]/g, ".") ?? "";
  const expiry = dateMatch?.[1]?.replace(/[\/\-]/g, ".") ?? "";

  // Adresă — linia după "Domiciliu" sau "Adresa"
  const addressMatch = text.match(/(?:Domiciliu|Adresa?)\s*:?\s*\n?\s*(.+)/i);

  return {
    last_name: numeMatch?.[1]?.trim() ?? "",
    first_name: prenumeMatch?.[1]?.trim() ?? "",
    cnp: cnpMatch?.[1] ?? "",
    series: seriesMatch?.[1] ?? "",
    number: seriesMatch?.[2] ?? "",
    address: addressMatch?.[1]?.trim() ?? "",
    birthdate: toISODate(birthdate),
    expiry_date: toISODate(expiry),
  };
}

function toISODate(romanian: string): string {
  // Convertește DD.MM.YYYY → YYYY-MM-DD
  const parts = romanian.split(".");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
