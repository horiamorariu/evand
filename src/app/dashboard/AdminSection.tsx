"use client";

import { useState, useEffect, useCallback } from "react";
import MonthCalendar from "@/app/admin/MonthCalendar";
import DailySummary from "@/app/admin/DailySummary";
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

export default function AdminSection() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-4 mt-6">
      <div className="border-t border-gray-200 pt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Activitate agenție</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
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
        <div className="mt-4">
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
        </div>
      </div>
    </div>
  );
}
