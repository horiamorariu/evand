"use client";

import { useState } from "react";
import Link from "next/link";

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  cnp: string;
  address: string;
  created_at: string;
  doc_count: number;
  notes?: string;
}

interface Props {
  clients: ClientRow[];
}

export default function HistoryClient({ clients }: Props) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.cnp.includes(q)
    );
  });

  function exportCSV() {
    const header = ["Nume", "Prenume", "CNP", "Adresa", "Data", "Nr. documente", "Notite"];
    const rows = clients.map((c) => [
      c.last_name,
      c.first_name,
      c.cnp,
      `"${c.address.replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleDateString("ro-RO"),
      String(c.doc_count),
      `"${(c.notes ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evand-clienti-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 transition-colors">
            ← Înapoi
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">Istoric clienți</h1>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 transition-colors"
        >
          <span>↓</span> Export Google Sheets
        </button>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Caută după nume sau CNP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <p className="text-xs text-gray-400">{filtered.length} clienți</p>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Niciun rezultat.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/client/${client.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {client.cnp} · {new Date(client.created_at).toLocaleDateString("ro-RO")} · {client.doc_count} doc.
                    </p>
                    {client.notes && (
                      <p className="text-xs text-amber-600 mt-0.5 truncate max-w-xs">📝 {client.notes}</p>
                    )}
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
