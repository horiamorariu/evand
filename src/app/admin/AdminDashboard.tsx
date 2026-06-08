"use client";

import { useState, useEffect, useCallback } from "react";
import MonthCalendar from "./MonthCalendar";
import DailySummary from "./DailySummary";
import type { DocumentStatus } from "@/types";

interface DocRow {
  id: string;
  client_name: string;
  client_cnp: string;
  agent_name: string;
  type: "mandat" | "gdpr";
  status: DocumentStatus;
  created_at: string;
  signed_file_data?: string;
}

interface Props {
  agencyName: string;
  agentName: string;
}

export default function AdminDashboard({ agencyName, agentName }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  // luna afișată în calendar
  const monthStart = selectedDate.slice(0, 7) + "-01";

  const fetchDocuments = useCallback(async (monthStr: string) => {
    setLoading(true);
    try {
      const from = monthStr;
      const d = new Date(monthStr);
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
      const to = d.toISOString().slice(0, 10) + "T23:59:59";
      const res = await fetch(`/api/admin/documents?from=${from}&to=${to}`);
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(monthStart);
  }, [monthStart, fetchDocuments]);

  function handleSelectDate(date: string) {
    const newMonth = date.slice(0, 7) + "-01";
    setSelectedDate(date);
    if (newMonth !== monthStart) fetchDocuments(newMonth);
  }

  function handleStatusChange(id: string, status: DocumentStatus) {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
  }

  const todayCount = documents.filter((d) => d.created_at.startsWith(today)).length;
  const monthCount = documents.length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Evand Admin</h1>
          <p className="text-xs text-gray-500">{agencyName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{agentName}</span>
          <a href="/dashboard" className="text-xs text-blue-600 hover:underline">← Dashboard</a>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Stats rapide */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Azi</p>
            <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
            <p className="text-xs text-gray-400">documente</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Luna aceasta</p>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : monthCount}</p>
            <p className="text-xs text-gray-400">documente</p>
          </div>
        </div>

        {/* Calendar */}
        <MonthCalendar
          documents={documents}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />

        {/* Sumar zilnic */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DailySummary
            documents={documents}
            selectedDate={selectedDate}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}
