"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  cnp: string;
  address: string;
  property_address: string;
  created_at: string;
  doc_count: number;
  notes?: string;
}

interface Props {
  clients: ClientRow[];
}

type Period = "azi" | "saptamana" | "luna" | "tot";

const PERIOD_LABELS: Record<Period, string> = {
  azi: "Azi",
  saptamana: "7 zile",
  luna: "Luna aceasta",
  tot: "Tot",
};

export default function HistoryClient({ clients }: Props) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("luna");

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return clients.filter((c) => {
      const t = new Date(c.created_at).getTime();
      if (period === "azi" && t < todayStart) return false;
      if (period === "saptamana" && t < weekStart) return false;
      if (period === "luna" && t < monthStart) return false;

      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.cnp.includes(q) ||
        (c.property_address ?? "").toLowerCase().includes(q)
      );
    });
  }, [clients, period, search]);

  function exportCSV() {
    const header = ["Nume", "Prenume", "CNP", "Domiciliu", "Adresa proprietate", "Data", "Nr. documente", "Notite"];
    const rows = filtered.map((c) => [
      c.last_name,
      c.first_name,
      c.cnp,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${(c.property_address ?? "").replace(/"/g, '""')}"`,
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
          <h1 className="text-base font-bold text-gray-900">Istoric clienți</h1>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 transition-colors"
        >
          ↓ Export CSV
        </button>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-3">
        {/* Filtre perioadă */}
        <div className="flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Caută după nume, CNP sau adresă..."
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
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                    {client.property_address && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {client.property_address}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(client.created_at).toLocaleDateString("ro-RO")} · {client.doc_count} doc.
                      {client.notes && <span className="ml-1">· 📝</span>}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg ml-2">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
