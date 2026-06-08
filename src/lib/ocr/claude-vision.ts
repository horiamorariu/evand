import Anthropic from "@anthropic-ai/sdk";
import type { BuletinData } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function extractBuletinData(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<BuletinData> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY lipsă");

  const validMime = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)
    ? (mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
    : "image/jpeg";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: validMime, data: imageBase64 },
          },
          {
            type: "text",
            text: `Extrage datele din această carte de identitate românească și returnează DOAR un obiect JSON cu aceste câmpuri:

{
  "last_name": "numele de familie cu majuscule",
  "first_name": "prenumele cu majuscule",
  "cnp": "CNP-ul de 13 cifre",
  "series": "seria (2 litere, ex: RT, IF, CJ, MS)",
  "number": "numărul (6 cifre)",
  "address": "adresa completă de domiciliu",
  "birthdate": "data nașterii YYYY-MM-DD (calculează din CNP dacă nu e explicit)",
  "expiry_date": "data expirării YYYY-MM-DD"
}

Returnează DOAR JSON-ul, fără altceva. Câmpurile nevizibile → string gol "".`,
          },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Claude OCR raw response:", raw);
    throw new Error("Răspuns invalid de la Claude");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    last_name: String(parsed.last_name ?? "").trim(),
    first_name: String(parsed.first_name ?? "").trim(),
    cnp: String(parsed.cnp ?? "").replace(/\D/g, ""),
    series: String(parsed.series ?? "").toUpperCase().trim(),
    number: String(parsed.number ?? "").replace(/\D/g, ""),
    address: String(parsed.address ?? "").trim(),
    birthdate: String(parsed.birthdate ?? ""),
    expiry_date: String(parsed.expiry_date ?? ""),
  };
}
