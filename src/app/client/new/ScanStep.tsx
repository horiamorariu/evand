"use client";

import { useState, useRef } from "react";
import { BuletinData } from "@/types";

interface Props {
  onComplete: (data: BuletinData) => void;
}

export default function ScanStep({ onComplete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!res.ok) throw new Error("OCR a eșuat");

      const data: BuletinData = await res.json();
      onComplete(data);
    } catch {
      setError("Nu s-au putut extrage datele. Încearcă o fotografie mai clară.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Scanează buletinul</h2>
        <p className="text-sm text-gray-500">
          Fotografiați fața buletinului în lumină bună, fără umbre.
        </p>
      </div>

      {/* Zona de captură */}
      <div
        className="w-full aspect-[1.58/1] max-w-sm rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-blue-600">Se procesează...</p>
          </div>
        ) : (
          <>
            <span className="text-4xl mb-3">📷</span>
            <p className="text-sm font-medium text-blue-700">Apasă pentru a fotografia</p>
            <p className="text-xs text-blue-400 mt-1">sau încarcă o imagine</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 w-full text-center">
          {error}
        </p>
      )}

      <div className="w-full bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
        <p className="text-xs text-amber-700">
          <strong>GDPR:</strong> Imaginea nu se stochează — se folosesc doar datele extrase.
        </p>
      </div>
    </div>
  );
}
