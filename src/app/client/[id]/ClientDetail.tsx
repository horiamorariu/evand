"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function ClientDetail({ clientId, firstName, lastName, cnp, address, createdAt, notes: initialNotes, documents }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  function openCalendar() {
    const title = encodeURIComponent(`${firstName} ${lastName} — Dosar imobiliar`);
    const details = encodeURIComponent(`CNP: ${cnp}\nAdresă: ${address}`);
    const now = new Date();
    const start = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "00Z";
    const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").slice(0, 15) + "00Z";
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`,
      "_blank"
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors">
            ← Înapoi
          </Link>
        </div>
        <button
          onClick={openCalendar}
          className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-3 py-2 transition-colors border border-blue-200"
        >
          📅 Adaugă în Calendar
        </button>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        {/* Info client */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">{firstName} {lastName}</h2>
          <p className="text-sm text-gray-500 mt-1">CNP: {cnp}</p>
          <p className="text-sm text-gray-500">{address}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Documente */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">Documente</p>
            </div>
            <ul className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <li key={doc.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {doc.type === "mandat" ? "Contract de mandat" : "Acord GDPR"}
                    </p>
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

        {/* Notițe */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">📝 Notițe</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adaugă notițe despre acest client..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={saveNotes}
            disabled={saving}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50"
          >
            {saving ? "Se salvează..." : saved ? "✓ Salvat!" : "Salvează notițele"}
          </button>
        </div>
      </main>
    </div>
  );
}
