"use client";

import { useState } from "react";
import { DocumentType } from "@/types";

interface Props {
  selected: DocumentType[];
  onComplete: (docs: DocumentType[]) => void;
}

const DOCUMENTS: { type: DocumentType; title: string; description: string }[] = [
  {
    type: "mandat",
    title: "Contract de mandat",
    description: "Împuternicire agent imobiliar pentru vânzare/cumpărare",
  },
  {
    type: "gdpr",
    title: "Acord GDPR",
    description: "Consimțământ prelucrare date personale",
  },
];

export default function DocumentsStep({ selected: initial, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<DocumentType>>(new Set(initial));

  function toggle(type: DocumentType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Selectează documentele</h2>
        <p className="text-sm text-gray-500">Alege ce documente vrei să generezi.</p>
      </div>

      <div className="space-y-3">
        {DOCUMENTS.map(({ type, title, description }) => {
          const isSelected = selected.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selected.size === 0}
        onClick={() => onComplete(Array.from(selected))}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        Continuă →
      </button>
    </div>
  );
}
