"use client";

import { useState } from "react";

interface Props {
  clientName: string;
  tipTranzactie?: string;
  tipProprietate?: string;
  propertyAddress?: string;
  onClose: () => void;
}

const TIP_TRANZACTIE_LABELS: Record<string, string> = {
  vanzare: "Vanzare",
  inchiriere: "Inchiriere",
  vizionare: "Vizionare",
  rezervare: "Rezervare",
};

const TIP_PROPRIETATE_LABELS: Record<string, string> = {
  apartament: "Apartament",
  casa: "Casa",
  teren: "Teren",
  comercial: "Comercial",
};

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 oră", minutes: 60 },
  { label: "1.5 ore", minutes: 90 },
  { label: "2 ore", minutes: 120 },
];

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatForGCal(dateStr: string, timeStr: string): string {
  return dateStr.replace(/-/g, "") + "T" + timeStr.replace(":", "") + "00";
}

function addMinutes(dateStr: string, timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(h, m + minutes, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const endDate = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `${endDate}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export default function CalendarModal({ clientName, tipTranzactie, tipProprietate, propertyAddress, onClose }: Props) {
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);

  const tipTrz = tipTranzactie ? TIP_TRANZACTIE_LABELS[tipTranzactie] ?? tipTranzactie : null;
  const tipProp = tipProprietate ? TIP_PROPRIETATE_LABELS[tipProprietate] ?? tipProprietate : null;

  const titleParts = [
    clientName,
    tipTrz && tipProp ? `${tipTrz} ${tipProp}` : tipTrz ?? tipProp,
    propertyAddress,
  ].filter(Boolean);
  const eventTitle = titleParts.join(" - ");

  function openCalendar() {
    const start = formatForGCal(date, time);
    const end = addMinutes(date, time, duration);
    const title = encodeURIComponent(eventTitle);
    const details = encodeURIComponent(`Agent: Evand\nAdresă: ${propertyAddress ?? "-"}`);
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`,
      "_blank"
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Adaugă în Google Calendar</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{eventTitle}</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Ora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ora de început</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Durată */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Durată</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.minutes}
                  type="button"
                  onClick={() => setDuration(d.minutes)}
                  className={`rounded-xl border-2 py-2.5 text-xs font-semibold transition-colors ${
                    duration === d.minutes
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Butoane */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={openCalendar}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white transition-colors"
          >
            Deschide Calendar →
          </button>
        </div>
      </div>
    </div>
  );
}
