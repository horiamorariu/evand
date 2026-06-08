"use client";

import { useState, useEffect, useCallback } from "react";
import WeekCalendar from "@/app/admin/WeekCalendar";
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

function localStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return localStr(d);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localStr(d);
}

export default function AdminSection() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(() => getMondayOf(today));
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [monthDocuments, setMonthDocuments] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);

  const fetchWeek = useCallback(async (monday: string) => {
    setLoading(true);
    try {
      const sunday = addDays(monday, 6);
      const res = await fetch(`/api/admin/documents?from=${monday}&to=${sunday}T23:59:59`);
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonth = useCallback(async () => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const to = `${lastDay.toISOString().slice(0, 10)}T23:59:59`;
    const res = await fetch(`/api/admin/documents?from=${from}&to=${to}`);
    const data = await res.json();
    setMonthDocuments(data.documents ?? []);
  }, []);

  useEffect(() => {
    fetchWeek(weekStart);
  }, [weekStart, fetchWeek]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
  }

  function handlePrevWeek() {
    const newMonday = addDays(weekStart, -7);
    setWeekStart(newMonday);
    setSelectedDate(newMonday);
  }

  function handleNextWeek() {
    const newMonday = addDays(weekStart, 7);
    setWeekStart(newMonday);
    setSelectedDate(newMonday);
  }

  function handleStatusChange(id: string, status: DocumentStatus) {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    setMonthDocuments((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
  }

  const SIGNED: DocumentStatus[] = ["semnat_olograf", "complet"];

  const generatedToday = documents.filter((d) => d.created_at.startsWith(today)).length;
  const signedToday = documents.filter((d) => d.created_at.startsWith(today) && SIGNED.includes(d.status)).length;
  const monthTotal = monthDocuments.length;
  const monthSigned = monthDocuments.filter((d) => SIGNED.includes(d.status)).length;
  const signedPct = monthTotal > 0 ? Math.round((monthSigned / monthTotal) * 100) : 0;

  return (
    <div className="space-y-4 mt-6">
      <div className="border-t border-gray-200 pt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Activitate Agent</p>

        {/* KPI-uri */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-3">
            <p className="text-[10px] text-gray-400 mb-1 leading-tight">Generate azi</p>
            <p className="text-2xl font-bold text-gray-900">{generatedToday}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-3">
            <p className="text-[10px] text-gray-400 mb-1 leading-tight">Semnate azi</p>
            <p className="text-2xl font-bold text-gray-900">{signedToday}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-3">
            <p className="text-[10px] text-gray-400 mb-1 leading-tight">Semnate / lună</p>
            <p className="text-2xl font-bold text-gray-900">{signedPct}<span className="text-sm font-normal text-gray-400">%</span></p>
          </div>
        </div>

        {/* Calendar săptămânal */}
        <WeekCalendar
          documents={documents}
          selectedDate={selectedDate}
          weekStart={weekStart}
          onSelectDate={handleSelectDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />

        {/* Sumar zilnic — colapsibil, doar azi */}
        <div className="mt-4">
          <button
            onClick={() => setSummaryOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-gray-700">Ce s-a semnat azi</span>
            <span className="text-gray-400 text-lg">{summaryOpen ? "▾" : "▸"}</span>
          </button>
          {summaryOpen && (
            <div className="mt-2">
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
          )}
        </div>
      </div>
    </div>
  );
}
