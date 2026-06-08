// Agenție și utilizatori
export interface Agency {
  id: string;
  name: string;
  cui: string;
  address: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  agency_id: string;
  full_name: string;
  email: string;
  role: "admin" | "agent";
  phone?: string;
  created_at: string;
  agency?: Agency;
}

// Date extrase din buletin prin OCR
export interface BuletinData {
  last_name: string;
  first_name: string;
  cnp: string;
  series: string;
  number: string;
  address: string;
  birthdate: string;
  expiry_date: string;
}

// Client (dosar)
export interface Client {
  id: string;
  agent_id: string;
  agency_id: string;
  last_name: string;
  first_name: string;
  cnp: string;
  buletin_series: string;
  buletin_number: string;
  address: string;
  birthdate: string;
  buletin_expiry: string;
  created_at: string;
  documents?: Document[];
}

// Scenarii
export type TipTranzactie = "vanzare" | "inchiriere" | "vizionare" | "rezervare";
export type TipProprietate = "apartament" | "casa" | "teren" | "comercial";

export interface ScenarioData {
  tip_tranzactie: TipTranzactie;
  tip_proprietate: TipProprietate;
}

// Documente
export type DocumentType = "mandat" | "gdpr" | "exclusivitate" | "fisa_vizionare" | "bon_rezervare";
export type DocumentStatus = "generat" | "printat" | "semnat_olograf" | "complet";

export interface Document {
  id: string;
  client_id: string;
  agent_id: string;
  agency_id: string;
  agent_name: string;
  client_name: string;
  client_cnp: string;
  type: DocumentType;
  status: DocumentStatus;
  file_path?: string;
  signed_file_path?: string;
  created_at: string;
}

// Câmpuri suplimentare unificate
export interface ExtraFields {
  // Comun — adresa proprietății
  property_address?: string;

  // Mandat
  mandate_type?: "exclusiv" | "neexclusiv";
  commission_percent?: number;
  duration_months?: number;

  // Apartament
  etaj?: string;
  nr_camere?: string;
  suprafata_utila?: string;
  nr_cadastral?: string;
  carte_funciara?: string;

  // Casă / Vilă
  suprafata_construita?: string;
  suprafata_teren?: string;
  regim_inaltime?: string;

  // Teren
  suprafata_mp?: string;
  categorie_folosinta?: string;
  intravilan?: "intravilan" | "extravilan";

  // Comercial
  destinatie?: string;

  // Bon rezervare
  suma_rezervare?: string;
  moneda?: "RON" | "EUR";
}

// Backwards compat alias
export type MandatExtraFields = ExtraFields;
export interface GdprExtraFields { purpose?: string; }
export type DocumentExtraFields = ExtraFields;

// Stare flux "client nou"
export interface NewClientState {
  buletin_data?: BuletinData;
  scenario?: ScenarioData;
  selected_documents: DocumentType[];
  extra_fields: ExtraFields;
  signature_data?: string;
}

// Mapping scenariu → documente pre-selectate
export function getScenarioDocs(s: ScenarioData): DocumentType[] {
  const { tip_tranzactie, tip_proprietate } = s;
  switch (tip_tranzactie) {
    case "vanzare":
      if (tip_proprietate === "teren") return ["gdpr", "mandat"];
      return ["gdpr", "mandat", "fisa_vizionare"];
    case "inchiriere":
      return ["gdpr", "mandat"];
    case "vizionare":
      return ["gdpr", "fisa_vizionare"];
    case "rezervare":
      return ["gdpr", "bon_rezervare"];
    default:
      return ["gdpr"];
  }
}
