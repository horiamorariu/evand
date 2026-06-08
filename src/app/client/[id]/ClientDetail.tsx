"use client";

import { useState } from "react";
import Link from "next/link";
import CalendarModal from "@/components/CalendarModal";

interface DocRow {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

interface Props {
  clientId: string;
  firstName: string;
  lastName: string;
  cnp: string;
  address: string;
  propertyAddress: string;
  tipTranzactie?: string;
  tipProprietate?: string;
  createdAt: string;
  docCount: number;
  notes: string;
  documents: DocRow[];
}

const STATUS_LABELS: Record<string, string> = {
  generat: "Generat",
  printat: "Printat",
  semnat_olograf: "Semnat olograf",
  complet: "Complet",
};

const STATUS_COLORS: Record<string, string> = {
  generat: "bg-blue-100 text-blue-700",
  printat: "bg-amber-100 text-amber-700",
  semnat_olograf: "bg-orange-100 text-orange-700",
  complet: "bg-green-100 text-green-700",
};

const DOC_LABELS: Record<string, string> = {
  mandat: "Contract de mandat",
  gdpr: "Acord GDPR",
  fisa_vizionare: "Fișă de vizionare",
  exclusivitate: "Contract de exclusivitate",
  bon_rezervare: "Bon de rezervare",
};

export default function ClientDetail({
  clientId, firstName, lastName, cnp, address, propertyAddress,
  tipTranzactie, tipProprietate, createdAt, notes: initialNotes, documents,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await fetch(`/api/client/${clientId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors">
          ← Înapoi
        </Link>
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-2 transition-colors border border-blue-200"
        >
          📅 Adaugă în Calendar
        </button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">{lastName} {firstName}</h2>
          <p className="text-sm text-gray-500 mt-1">CNP: {cnp}</p>
          {propertyAddress && (
            <p className="text-sm font-medium text-blue-700 mt-1">📍 {propertyAddress}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">Domiciliu: {address}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">Documente</p>
            </div>
            <ul className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <li key={doc.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{DOC_LABELS[doc.type] ?? doc.type}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${STATUS_COLORS[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[doc.status] ?? doc.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">📝 Notițe</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adaugă notițe despre acest client..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button onClick={saveNotes} disabled={saving}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50">
            {saving ? "Se salvează..." : saved ? "✓ Salvat!" : "Salvează notițele"}
          </button>
        </div>
      </main>

      {calendarOpen && (
        <CalendarModal
          clientName={`${lastName} ${firstName}`}
          tipTranzactie={tipTranzactie}
          tipProprietate={tipProprietate}
          propertyAddress={propertyAddress || address}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
}
