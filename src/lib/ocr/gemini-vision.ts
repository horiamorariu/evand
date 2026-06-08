import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BuletinData } from "@/types";

export async function extractBuletinData(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<BuletinData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY lipsă");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Ești un sistem de extragere date din cărți de identitate românești (buletin/CI).
Analizează imaginea și returnează UN SINGUR OBIECT JSON cu aceste câmpuri exacte:

{
  "last_name": "numele de familie (litere mari, ex: MORARIU)",
  "first_name": "prenumele complet (litere mari, ex: HORIA CRISTIAN)",
  "cnp": "CNP-ul de 13 cifre (doar cifre)",
  "series": "seria cărții de identitate (2 litere mari, ex: RT, IF, MS, CJ)",
  "number": "numărul cărții de identitate (6 cifre)",
  "address": "adresa de domiciliu completă (stradă, număr, localitate, județ)",
  "birthdate": "data nașterii în format YYYY-MM-DD (calculează din CNP dacă nu e vizibilă)",
  "expiry_date": "data expirării în format YYYY-MM-DD"
}

Reguli:
- Returnează DOAR JSON-ul, fără text în jur, fără markdown, fără \`\`\`
- Dacă un câmp nu e lizibil, pune string gol ""
- CNP: primele 2 cifre după prima = anul nașterii (ex: 1850101 = 1985, 5850101 = 2085 pentru cei cu 5/6 la început)
- Series și number sunt pe rândul cu "Seria XX Nr. NNNNNN" sau similar`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  const raw = result.response.text().trim();

  // Extrage JSON chiar dacă Gemini adaugă text extra
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Gemini raw response:", raw);
    throw new Error("Răspuns invalid de la Gemini");
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
