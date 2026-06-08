import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { BuletinData, ExtraFields, Agency, Profile } from "@/types";

// backwards compat
type MandatExtraFields = ExtraFields;

function ro(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = ro(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: PDFFont,
  lineHeight: number
): number {
  const lines = wrapText(text, maxWidth, font, size);
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight;
  }
  return y;
}

interface GenerateOptions {
  buletinData: BuletinData;
  agent: Profile;
  agency: Agency;
  signatureBase64?: string;
}

export async function generateMandat(
  opts: GenerateOptions & { extra: MandatExtraFields }
): Promise<Uint8Array> {
  const { buletinData, agent, agency, extra, signatureBase64 } = opts;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const maxW = width - margin * 2;
  const valueX = margin + 150;
  const valueMaxW = width - margin - valueX;
  let y = height - margin;

  function dt(text: string, x: number, yPos: number, size = 11, bold = false) {
    page.drawText(ro(text), { x, y: yPos, size, font: bold ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
  }

  function line(label: string, value: string, yPos: number): number {
    dt(`${label}:`, margin, yPos, 10, true);
    const lines = wrapText(value, valueMaxW, fontRegular, 10);
    let ly = yPos;
    for (const l of lines) {
      page.drawText(l, { x: valueX, y: ly, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      ly -= 14;
    }
    return Math.min(ly, yPos - 18);
  }

  // Antet
  dt(agency.name, margin, y, 14, true);
  y -= 16;
  y = drawWrapped(page, `CUI: ${agency.cui} | ${agency.address}`, margin, y, maxW, 9, fontRegular, 13);
  y -= 14;

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 22;

  dt("CONTRACT DE MANDAT IMOBILIAR", margin, y, 14, true);
  y -= 32;

  dt("DATE MANDANT (CLIENT)", margin, y, 10, true);
  y -= 18;
  y = line("Nume si prenume", `${buletinData.last_name} ${buletinData.first_name}`, y);
  y = line("CNP", buletinData.cnp, y);
  y = line("Buletin", `${buletinData.series} ${buletinData.number}`, y);
  y = line("Domiciliu", buletinData.address, y);
  y -= 12;

  dt("DATE PROPRIETATE", margin, y, 10, true);
  y -= 18;
  y = line("Adresa proprietatii", extra.property_address ?? "-", y);
  y = line("Tip mandat", extra.mandate_type ?? "-", y);
  y = line("Comision", `${extra.commission_percent}%`, y);
  y = line("Durata mandat", `${extra.duration_months} luni`, y);
  y -= 12;

  dt("DATE MANDATAR (AGENT)", margin, y, 10, true);
  y -= 18;
  y = line("Agent", agent.full_name, y);
  y = line("Agentie", agency.name, y);
  y = line("Data semnarii", new Date().toLocaleDateString("ro-RO"), y);
  y -= 25;

  if (signatureBase64) {
    try {
      const sigImage = await doc.embedPng(
        Buffer.from(signatureBase64.replace(/^data:image\/png;base64,/, ""), "base64")
      );
      page.drawImage(sigImage, { x: margin, y: y - 60, width: 150, height: 60 });
      dt("Semnatura client", margin, y - 72, 9);
    } catch { /* fara semnatura */ }
  }

  return doc.save();
}

export async function generateGdpr(opts: GenerateOptions): Promise<Uint8Array> {
  const { buletinData, agency } = opts;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const maxW = width - margin * 2;
  let y = height - margin;

  page.drawText(ro(agency.name), { x: margin, y, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 28;
  page.drawText("ACORD PRELUCRARE DATE CU CARACTER PERSONAL (GDPR)", { x: margin, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 30;

  const today = new Date().toLocaleDateString("ro-RO");

  const paragraphs = [
    `Subsemnatul/a ${buletinData.last_name} ${buletinData.first_name}, CNP ${buletinData.cnp}, domiciliat/a in ${buletinData.address}, imi exprim acordul privind prelucrarea datelor cu caracter personal de catre ${agency.name}, in conformitate cu Regulamentul (UE) 2016/679 (GDPR).`,
    `Datele vor fi prelucrate exclusiv in scopul intermedierii imobiliare si nu vor fi transmise catre terti fara consimtamantul explicit al persoanei vizate.`,
    `Data: ${today}`,
  ];

  for (const para of paragraphs) {
    y = drawWrapped(page, para, margin, y, maxW, 10, fontRegular, 16);
    y -= 10;
  }

  return doc.save();
}

// Helper: page skeleton shared by simple docs
async function makeDoc() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { doc, page, fontRegular, fontBold, width: 595, height: 842 };
}

export async function generateFisaVizionare(
  opts: GenerateOptions & { extra: ExtraFields }
): Promise<Uint8Array> {
  const { buletinData, agent, agency, extra } = opts;
  const { doc, page, fontRegular, fontBold, width, height } = await makeDoc();
  const margin = 50;
  const maxW = width - margin * 2;
  const valueX = margin + 150;
  const valueMaxW = width - margin - valueX;
  let y = height - margin;
  const today = new Date().toLocaleDateString("ro-RO");

  function dt(text: string, x: number, yPos: number, size = 11, bold = false) {
    page.drawText(ro(text), { x, y: yPos, size, font: bold ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
  }
  function line(label: string, value: string, yPos: number): number {
    dt(`${label}:`, margin, yPos, 10, true);
    const lines = wrapText(value, valueMaxW, fontRegular, 10);
    let ly = yPos;
    for (const l of lines) { page.drawText(l, { x: valueX, y: ly, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) }); ly -= 14; }
    return Math.min(ly, yPos - 18);
  }

  dt(agency.name, margin, y, 14, true); y -= 16;
  y = drawWrapped(page, `CUI: ${agency.cui} | ${agency.address}`, margin, y, maxW, 9, fontRegular, 13); y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) }); y -= 22;
  dt("FISA DE VIZIONARE", margin, y, 14, true); y -= 32;

  dt("DATE CLIENT", margin, y, 10, true); y -= 18;
  y = line("Nume si prenume", `${buletinData.last_name} ${buletinData.first_name}`, y);
  y = line("CNP", buletinData.cnp, y);
  y = line("Buletin", `${buletinData.series} ${buletinData.number}`, y); y -= 12;

  dt("DATE PROPRIETATE", margin, y, 10, true); y -= 18;
  y = line("Adresa", extra.property_address ?? "-", y); y -= 12;

  dt("DATE AGENT", margin, y, 10, true); y -= 18;
  y = line("Agent", agent.full_name, y);
  y = line("Agentie", agency.name, y);
  y = line("Data vizionarii", today, y); y -= 25;

  drawWrapped(page,
    "Prin semnarea prezentei fise, confirm ca am vizionat proprietatea de mai sus prin intermediul agentiei si ca am fost informat cu privire la conditiile de intermediere.",
    margin, y, maxW, 9, fontRegular, 14);

  return doc.save();
}

export async function generateExclusivitate(
  opts: GenerateOptions & { extra: ExtraFields }
): Promise<Uint8Array> {
  const { buletinData, agent, agency, extra } = opts;
  const { doc, page, fontRegular, fontBold, width, height } = await makeDoc();
  const margin = 50;
  const maxW = width - margin * 2;
  const valueX = margin + 150;
  const valueMaxW = width - margin - valueX;
  let y = height - margin;
  const today = new Date().toLocaleDateString("ro-RO");

  function dt(text: string, x: number, yPos: number, size = 11, bold = false) {
    page.drawText(ro(text), { x, y: yPos, size, font: bold ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
  }
  function line(label: string, value: string, yPos: number): number {
    dt(`${label}:`, margin, yPos, 10, true);
    const lines = wrapText(value, valueMaxW, fontRegular, 10);
    let ly = yPos;
    for (const l of lines) { page.drawText(l, { x: valueX, y: ly, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) }); ly -= 14; }
    return Math.min(ly, yPos - 18);
  }

  dt(agency.name, margin, y, 14, true); y -= 16;
  y = drawWrapped(page, `CUI: ${agency.cui} | ${agency.address}`, margin, y, maxW, 9, fontRegular, 13); y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) }); y -= 22;
  dt("CONTRACT DE EXCLUSIVITATE", margin, y, 14, true); y -= 32;

  dt("DATE PROPRIETAR", margin, y, 10, true); y -= 18;
  y = line("Nume si prenume", `${buletinData.last_name} ${buletinData.first_name}`, y);
  y = line("CNP", buletinData.cnp, y);
  y = line("Domiciliu", buletinData.address, y); y -= 12;

  dt("DATE PROPRIETATE", margin, y, 10, true); y -= 18;
  y = line("Adresa", extra.property_address ?? "-", y);
  if (extra.commission_percent !== undefined) y = line("Comision", `${extra.commission_percent}%`, y);
  if (extra.duration_months) y = line("Durata", `${extra.duration_months} luni`, y); y -= 12;

  dt("DATE AGENT", margin, y, 10, true); y -= 18;
  y = line("Agent", agent.full_name, y);
  y = line("Agentie", agency.name, y);
  y = line("Data semnarii", today, y); y -= 25;

  drawWrapped(page,
    "Proprietarul acorda agentiei dreptul exclusiv de intermediere a vanzarii/inchirierii proprietatii descrise mai sus pe durata mentionata. In aceasta perioada, proprietarul nu va incheia contracte de intermediere cu alte agentii.",
    margin, y, maxW, 9, fontRegular, 14);

  return doc.save();
}

export async function generateBonRezervare(
  opts: GenerateOptions & { extra: ExtraFields }
): Promise<Uint8Array> {
  const { buletinData, agent, agency, extra } = opts;
  const { doc, page, fontRegular, fontBold, width, height } = await makeDoc();
  const margin = 50;
  const maxW = width - margin * 2;
  const valueX = margin + 150;
  const valueMaxW = width - margin - valueX;
  let y = height - margin;
  const today = new Date().toLocaleDateString("ro-RO");

  function dt(text: string, x: number, yPos: number, size = 11, bold = false) {
    page.drawText(ro(text), { x, y: yPos, size, font: bold ? fontBold : fontRegular, color: rgb(0.1, 0.1, 0.1) });
  }
  function line(label: string, value: string, yPos: number): number {
    dt(`${label}:`, margin, yPos, 10, true);
    const lines = wrapText(value, valueMaxW, fontRegular, 10);
    let ly = yPos;
    for (const l of lines) { page.drawText(l, { x: valueX, y: ly, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) }); ly -= 14; }
    return Math.min(ly, yPos - 18);
  }

  dt(agency.name, margin, y, 14, true); y -= 16;
  y = drawWrapped(page, `CUI: ${agency.cui} | ${agency.address}`, margin, y, maxW, 9, fontRegular, 13); y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) }); y -= 22;
  dt("BON DE REZERVARE", margin, y, 14, true); y -= 32;

  dt("DATE CLIENT", margin, y, 10, true); y -= 18;
  y = line("Nume si prenume", `${buletinData.last_name} ${buletinData.first_name}`, y);
  y = line("CNP", buletinData.cnp, y);
  y = line("Buletin", `${buletinData.series} ${buletinData.number}`, y); y -= 12;

  dt("DATE PROPRIETATE", margin, y, 10, true); y -= 18;
  y = line("Adresa", extra.property_address ?? "-", y);
  y = line("Suma rezervare", `${extra.suma_rezervare ?? "-"} ${extra.moneda ?? "RON"}`, y); y -= 12;

  dt("DATE AGENT", margin, y, 10, true); y -= 18;
  y = line("Agent", agent.full_name, y);
  y = line("Agentie", agency.name, y);
  y = line("Data rezervarii", today, y); y -= 25;

  drawWrapped(page,
    "Prin achitarea sumei de rezervare mentionate mai sus, cumparatorul rezerva proprietatea descrisa si isi exprima intentia ferma de cumparare. Suma de rezervare va fi dedusa din pretul de vanzare final.",
    margin, y, maxW, 9, fontRegular, 14);

  return doc.save();
}
