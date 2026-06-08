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

// Document generat
export type DocumentType = "mandat" | "gdpr";

export interface Document {
  id: string;
  client_id: string;
  agent_id: string;
  type: DocumentType;
  file_path: string;
  signed_at?: string;
  created_at: string;
}

// Date suplimentare pentru generare documente
export interface MandatExtraFields {
  property_address: string;
  mandate_type: "exclusiv" | "neexclusiv";
  commission_percent: number;
  duration_months: number;
}

export interface GdprExtraFields {
  purpose: string;
}

export type DocumentExtraFields = MandatExtraFields | GdprExtraFields;

// Stare flux "client nou"
export interface NewClientState {
  buletin_data?: BuletinData;
  selected_documents: DocumentType[];
  extra_fields: Partial<MandatExtraFields & GdprExtraFields>;
  signature_data?: string; // base64 PNG
}
